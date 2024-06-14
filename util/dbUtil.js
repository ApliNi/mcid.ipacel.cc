import { MCItemData } from "./Enum.js";
import { AsyncDB, db } from "./db.js";


let Temp = {
	getMcKey: {},
	getLang: {},
	getMcVer: {},
	getMcType: {},
	getMcName: {},
};


/**
 * 获取一个版本id
 * @param {string} verName '1.20.2'
 * @returns { pid: 764, ver: '1.20.2' }
 */
export async function getMcVer(verName) {
	return new Promise(async (resolve) => {
		// 如果 Temp 中有这个数据
		if(Temp.getMcVer[verName]){
			resolve(Temp.getMcVer[verName]);
		}

		let data = await AsyncDB.get('SELECT pid, ver FROM mcVer WHERE ver = ?;', [verName]);

		// 如果存在
		if(data !== undefined){
			Temp.getMcVer[verName] = data;
			resolve(data);
		}

		// 不存在
		resolve(undefined);
	});
};


/**
 * 获取一个 Type ID, 不存在则创建
 * @param {string} type 'item'
 * @param {boolean} create false
 * @returns { pid: 764, ver: '1.20.2' }
 */
export async function getMcType(type, create = false) {
	return new Promise(async (resolve) => {
		// 如果 Temp 中有这个数据
		if(Temp.getMcType[type]){
			resolve(Temp.getMcType[type]);
		}

		let data = await AsyncDB.get('SELECT id, type FROM mcType WHERE type = ?;', [type]);

		// 如果存在
		if(data !== undefined){
			Temp.getMcType[type] = data;
			resolve(data);

		}else if(create){
			// 创建记录, 然后重新查询
			db.prepare('INSERT OR IGNORE INTO mcType (type) VALUES (?);').run(type);
			resolve(await getMcType(type));
		}

		// 如果不需要创建
		resolve(null);
	});
};


// 获取一个物品的id, 如果不存在则创建
export async function getMcKey(name, create = false) {
	return new Promise(async (resolve) => {
		// 如果 Temp 中有这个数据
		if(Temp.getMcKey[name]){
			resolve(Temp.getMcKey[name]);
		}

		let data = await AsyncDB.get('SELECT id, key FROM mcKey WHERE key = ?;', [name]);

		// 如果存在
		if(data !== undefined){
			Temp.getMcKey[name] = data;
			resolve(data);

		}else if(create){
			// 创建记录, 然后重新查询
			db.prepare('INSERT OR IGNORE INTO mcKey (key) VALUES (?);').run(name);
			resolve(await getMcKey(name));
		}

		// 如果不需要创建
		resolve(null);
	});
};


// 获取一个名称的id, 如果不存在则创建
export async function getMcName(name, create = false) {
	return new Promise(async (resolve) => {
		// 如果 Temp 中有这个数据
		if(Temp.getMcName[name]){
			resolve(Temp.getMcName[name]);
		}

		let data = await AsyncDB.get('SELECT id, name FROM mcName WHERE name = ?;', [name]);

		// 如果存在
		if(data !== undefined){
			Temp.getMcName[name] = data;
			resolve(data);

		}else if(create){
			// 创建记录, 然后重新查询
			db.prepare('INSERT OR IGNORE INTO mcName (name) VALUES (?);').run(name);
			resolve(await getMcName(name));
		}

		// 如果不需要创建
		resolve(null);
	});
};


// 获取一个语言id
export async function getLang(name, create = false) {
	return new Promise(async (resolve) => {
		// 如果 Temp 中有这个数据
		if(Temp.getLang[name]){
			resolve(Temp.getLang[name]);
		}

		let data = await AsyncDB.get('SELECT id, lang FROM lang WHERE lang = ?;', [name]);

		// 如果存在
		if(data !== undefined){
			Temp.getLang[name] = data;
			resolve(data);

		}else if(create){
			// 创建记录, 然后重新查询
			db.prepare('INSERT OR IGNORE INTO lang (lang) VALUES (?);').run(name);
			resolve(await getLang(name));

		}else{
			// 如果不需要创建, 尝试获取相近的语言
			data = await AsyncDB.get(`SELECT id, lang FROM lang WHERE lang LIKE ? ESCAPE '\\' LIMIT 1;`, `${name.replaceAll(/\_.*/g, '')}\\_%`);
			if(data !== undefined){
				Temp.getLang[name] = data;
				resolve(data);

			}else{
				resolve(null);
			}
		}
	});
};


const sql_getMcID = db.prepare(`SELECT * FROM data WHERE Lang = ? AND Type = ? AND Key = ? AND Name = ?;`);
/**
 * 获取一个 MCItemData 的完整数据
 * @param {{Lang, Type, Key, Name}} idata
 * @returns {MCItemData}
 */
export async function getItemData(idata) {
	return new MCItemData().getDataFromDB(sql_getMcID.get([
		idata.Lang,
		idata.Type,
		idata.Key,
		idata.Name,
	]));
	// return Enum.mcID.fromDB(sql_getMcID.get([
	// 	mcID.Lang,
	// 	mcID.Type,
	// 	mcID.Key,
	// 	mcID.Name,
	// ]));
};


const sql_sendMcID = db.prepare(`
	INSERT OR IGNORE INTO
	data (Lang, Type, Key, Name, VerMax, VerMin)
	VALUES (?, ?, ?, ?, ?, ?)
	ON CONFLICT(Lang, Type, Key, Name) DO UPDATE SET VerMax = ?, VerMin = ?;
`);
/**
 * 将一个id保存到数据库
 * @param {MCItemData} mcID
 */
export async function sendMcID(mcID) {
	sql_sendMcID.run([
		mcID.Lang,
		mcID.Type,
		mcID.Key,
		mcID.Name,
		mcID.VerMax,
		mcID.VerMin,
		
		mcID.VerMax,
		mcID.VerMin,
	]);
};

