
import { logger } from '../util/logger.js';
import { AsyncDB, db } from '../util/db.js';
import { getLang } from '../util/dbUtil.js';
import { HttpPostList, Reply, Req } from '../util/Enum.js';


export const listQueryTemp_ver = 107;

/**
 * @param {Req} req
 * @param {Reply} reply
 */
export async function on(req, reply){
	reply.type('application/json; charset=utf-8');
	reply.header('Access-Control-Allow-Origin', '*');

	// 获取用户输入
	const udata = new HttpPostList().setData(req.query.l, req.query.q);
	if(udata === null){
		return reply.send('Invalid input: {Input} OR {Lang}');
	}

	const nowTime = process.uptime();

	let iM = {
		list: await whereMcID(udata),
		time: Math.round((process.uptime() - nowTime) * 1000),
	};

	logger.mark(`[api.list] IP=${req.ipac.ip} | Lang=${udata.lang}, Inp=${udata.inp}, Time=${iM.time}`);

	return reply.send(iM);
};


const sqls = {

	listQueryTemp_get: db.prepare(`SELECT id, data FROM listQueryTemp WHERE lang = ? AND text = ? AND ver = ?;`),

	listQueryTemp_put: db.prepare(`INSERT OR IGNORE INTO listQueryTemp (lang, text, ver, num, data) VALUES (?, ?, ?, 0, ?);`),

	listQueryTemp_add: db.prepare(`UPDATE listQueryTemp SET num = num + 1 WHERE id = ?;`),

	MATCH_key: db.prepare(`
		SELECT
			data.id,
			data.Lang AS langID,
			data.Type AS typeID,
			data.key AS keyID,
			data.Name AS nameID,
			data.VerMax AS verMaxID,
			lang.lang,
			mcType.type,
			mcKey_FTS.key,
			mcName.name,
			mcVerMin.ver AS VerMin,
			mcVerMax.ver AS VerMax
		FROM
			data
			JOIN lang       ON data.Lang = lang.id
			JOIN mcType     ON data.Type = mcType.id
			JOIN mcKey_FTS	ON data.key = mcKey_FTS.id
			JOIN mcName     ON data.Name = mcName.id
			JOIN mcVer AS mcVerMin  ON data.VerMin = mcVerMin.pid
			JOIN mcVer AS mcVerMax  ON data.VerMax = mcVerMax.pid
		WHERE
			data.Lang = $lang
			AND mcKey_FTS.key MATCH $inp
		ORDER BY rank
		LIMIT 64;
	`),

	MATCH_name: db.prepare(`
		SELECT
			data.id,
			data.Lang AS langID,
			data.Type AS typeID,
			data.key AS keyID,
			data.Name AS nameID,
			data.VerMax AS verMaxID,
			lang.lang,
			mcType.type,
			mcKey.key,
			mcName_FTS.name,
			mcVerMin.ver AS VerMin,
			mcVerMax.ver AS VerMax
		FROM
			data
			JOIN lang       ON data.Lang = lang.id
			JOIN mcType     ON data.Type = mcType.id
			JOIN mcKey		ON data.key = mcKey.id
			JOIN mcName_FTS	ON data.Name = mcName_FTS.id
			JOIN mcVer AS mcVerMin  ON data.VerMin = mcVerMin.pid
			JOIN mcVer AS mcVerMax  ON data.VerMax = mcVerMax.pid
		WHERE mcName_FTS.name MATCH $inp
		ORDER BY rank
		LIMIT 64;
	`),

	getDataShell: (WHERE) => `
		SELECT
			data.id,
			data.Lang AS langID,
			data.Type AS typeID,
			data.key AS keyID,
			data.Name AS nameID,
			data.VerMax AS verMaxID,
			lang.lang,
			mcType.type,
			mcKey.key,
			mcName.name,
			mcVerMin.ver AS VerMin,
			mcVerMax.ver AS VerMax
		FROM
			data
			JOIN lang	ON data.Lang = lang.id
			JOIN mcType	ON data.Type = mcType.id
			JOIN mcKey	ON data.key = mcKey.id
			JOIN mcName	ON data.Name = mcName.id
			JOIN mcVer AS mcVerMin	ON data.VerMin = mcVerMin.pid
			JOIN mcVer AS mcVerMax	ON data.VerMax = mcVerMax.pid
		WHERE ${WHERE}
		LIMIT 64;
	`,
};


/**
 * 获取查询结果列表数据
 * @param {HttpPostList} udata
 * @returns 查询结果列表数据
 */
async function whereMcID(udata) {

	const inp_langID = (await getLang(udata.lang)).id;

	// 检查查询缓存, 如果存在就直接使用缓存
	const listQueryTemp = (await AsyncDB._get(sqls.listQueryTemp_get, [inp_langID, udata.inp, listQueryTemp_ver]));
	if(listQueryTemp){
		AsyncDB._run(sqls.listQueryTemp_add, [listQueryTemp.id]);
		return JSON.parse(listQueryTemp.data);
	}

	// 查询语法支持
	let mode = 0;
	let c_inp = udata.inp;
	if(udata.inp.indexOf('=') === 0){
		mode = 1;
		c_inp = udata.inp.substring(0, 1);
	}

	// 完整查询
	const inp_LIKE = c_inp.replaceAll('\\', '\\\\').replaceAll('_', '\\_').replaceAll('%', '\\%');
	const inp_MATCH = c_inp.replaceAll(`"`, '').replaceAll(`'`, '');

	let MATCH_key	= [],
		MATCH_name	= [],
		LIKE_key	= [],
		LIKE_name	= [];

	// KEY 完全匹配
	const run_MATCH_key = async () => {
		MATCH_key = (await AsyncDB._all(sqls.MATCH_key, {lang: inp_langID, inp: `"${inp_MATCH}"`}));
	};

	// 名称分词匹配
	const run_MATCH_name = async () => {
		MATCH_name = (await AsyncDB._all(sqls.MATCH_name, {inp: `"${inp_MATCH}"`}));
	};

	// KEY 全表搜索
	const run_LIKE_key = async () => {
		LIKE_key = (await AsyncDB.all(sqls.getDataShell(`
			data.Lang = $lang
			AND mcKey.key LIKE $inp ESCAPE '\\' COLLATE NOCASE
			${MATCH_key.length === 0 ?'': `AND mcKey.id NOT IN (${MATCH_key.map((i) => i.id).join(',')})`}
		`), {lang: inp_langID, inp: `%${inp_LIKE}%`}))
	};

	// 名称全表搜索
	const run_LIKE_name = async () => {
		LIKE_name = (await AsyncDB.all(sqls.getDataShell(`
			mcName.name LIKE $inp ESCAPE '\\' COLLATE NOCASE
			${MATCH_name.length === 0 ?'': `AND mcName.id NOT IN (${MATCH_name.map((i) => i.id).join(',')})`}
		`), {inp: `%${inp_LIKE}%`}))
	};


	// 实现运行模式
	if(mode === 0){
		await run_MATCH_key();
		await run_MATCH_name();
		await run_LIKE_key();
		await run_LIKE_name();
	}else if(mode === 1){
		await run_MATCH_key();
		await run_LIKE_key();
	}

	// 按语言进行排序, 按顺序区分出相同语言和不同语言
	const cLang = [], oLang = [];

	let temp = [...MATCH_key, ...MATCH_name, ...LIKE_key, ...LIKE_name];
	for(const li of temp){
		if(li.langID === inp_langID){
			cLang.push(li);
		}else{
			oLang.push(li);
		}
	}


	// 如果为空, 就在这里退出
	if(cLang.length === 0 && oLang.length === 0){
		setListQueryTemp(inp_langID, udata.inp, []);
		return [];
	}

	/** @type {{apple: {}}} */
	const mix = {};
	const sql_p2_arr = [];

	// 遍历和打包数据
	temp = [...cLang, ...oLang];
	for(const li of temp){
		// 获取这个数据在缓存中的名称
		const k = `${li.typeID}.${li.keyID}`;

		// 如果不存在这个key
		if(!mix[k]){
			mix[k] = li;
		}else{
			// 这是一个相同key但不同语言的结果
			if(mix[k].diffLangs === undefined) mix[k].diffLangs = 0;
			mix[k].diffLangs ++;
		}

		// 为查找历史遗留名称准备语句
		sql_p2_arr.push(`(data.Lang=${mix[k].langID} AND data.Type=${mix[k].typeID} AND data.key=${mix[k].keyID} AND data.Name!=${mix[k].nameID})`)
	}


	// 查找历史遗留名称

	let i = 0;

	temp = await AsyncDB.all(`
		SELECT
			data.Type,
			data.Type AS typeID,
			data.key AS keyID,
			data.VerMax AS verMaxID,
			mcKey.key,
			mcName.name,
			mcVerMin.ver AS VerMin,
			mcVerMax.ver AS VerMax
		FROM
			data
			JOIN mcKey	ON data.key = mcKey.id
			JOIN mcName	ON data.Name = mcName.id
			JOIN mcVer AS mcVerMin	ON data.VerMin = mcVerMin.pid
			JOIN mcVer AS mcVerMax	ON data.VerMax = mcVerMax.pid
		WHERE
			${sql_p2_arr.join('OR')}
		LIMIT 1024;
	`);
	for(const li of temp){
		i += 0.0001;
		const k = `${li.typeID}.${li.keyID}`;
		if(mix[k].alias === undefined){
			mix[k].alias = [];
		}
		// 如果一个别名版本大于查询到的版本, 则调换这两个数据 :: 最新版本为主体
		if(li.verMaxID > mix[k].verMaxID){
			mix[k].alias.push([li.verMaxID + i, {
				name: 	mix[k].name,
				VerMin: mix[k].VerMin,
				VerMax: mix[k].VerMax,
			}]);
			mix[k].name		= li.name;
			mix[k].VerMin	= li.VerMin;
			mix[k].VerMax	= li.VerMax;
		}else{
			mix[k].alias.push([li.verMaxID + i, {
				name: 	li.name,
				VerMin: li.VerMin,
				VerMax: li.VerMax,
			}]);
		}
	}

	const out = [];

	for(let key in mix){
		let li = mix[key];
		if(li.alias){
			// 按数组的第0位进行排序
			li.alias.sort((a, b) => b[0] - a[0]);
			// 重新打包数据
			for(let key in li.alias){
				li.alias[key] = li.alias[key][1];
			}
		}

		out.push({
			id: li.id,
			key: li.key,
			lang: li.lang,
			name: li.name,
			type: li.type,
			VerMax: li.VerMax,
			VerMin: li.VerMin,
			diffLangs: li.diffLangs,
			alias: li.alias,
		});
	}

	// 将查询结果写入缓存表
	setListQueryTemp(inp_langID, udata.inp, out);
	return out;
};


// 创建缓存
async function setListQueryTemp(lang, text, dataJSON){
	await AsyncDB._run(sqls.listQueryTemp_put, [lang, text, listQueryTemp_ver, JSON.stringify(dataJSON)]);
	logger.mark(`[api.list] 创建缓存: ${text}`);
};
