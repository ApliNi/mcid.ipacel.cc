
import { HttpPostDetailed, Reply, Req } from '../util/Enum.js';
import { AsyncDB, db } from '../util/db.js';
import { getMcType } from '../util/dbUtil.js';
import { logger } from '../util/logger.js';

/**
 * @param {Req} req
 * @param {Reply} reply
 */
export async function on(req, reply){
	reply.type('application/json; charset=utf-8');
	reply.header('Access-Control-Allow-Origin', '*');

	// 获取用户输入
	const udate = new HttpPostDetailed().setData(req.query.t, req.query.k);
	if(udate === null){
		return reply.send('Invalid input: {Type} OR {Key}');
	}

	logger.mark(`[api.deta] IP=${req.ipac.ip} | Type=${udate.type}, Key=${udate.key}`);

	const iM = {
		lang: await getLangAll(udate),
	};

	return reply.send(iM);
};


const sqls = {
	getLangAll: db.prepare(`
		SELECT
			lang.lang,
			mcName.name
		FROM
			data
			JOIN lang	ON data.Lang = lang.id
			JOIN mcKey	ON data.key = mcKey.id
			JOIN mcName	ON data.Name = mcName.id
		WHERE
			data.Type = $typeID
			AND mcKey.key = $key
		ORDER BY
			lang.lang
		LIMIT 9999;
	`),
};


/**
 * 查询这个物品的所有语言
 * @param {HttpPostDetailed} udate
 * @returns 包含所有语言的列表
 */
async function getLangAll(udate) {

	const out = {};

	const data = await AsyncDB._all(sqls.getLangAll, {
		typeID: (await getMcType(udate.type)).id,
		key: udate.key,
	});

	for(const li of data){
		if(out[li.lang] === undefined){
			out[li.lang] = {
				nameList: [],
			};
		}
		out[li.lang].nameList.push(li.name);
	}

	return out;
};
