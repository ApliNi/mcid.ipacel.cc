

// 各种类型名称在数据库中的 ID
export const MCTypeID = {
	_: {
		block: 1,			// 方块
		biome: 2,			// 生物群系
		item: 3,			// 物品
		entity: 4,		// 实体
		enchantment: 5,	// 附魔
	},

	/**
	 * 获取一个类型对应的 ID
	 * @param {string} name 类型名称
	 * @returns {number}
	 */
	getID: function(name) {
		return this[name] || null;
	},
};


// 一个 MC 物品在数据库中的数据
export class MCItemData {
	constructor() {
		this.VerMax = null,
		this.VerMin = null,
		this.Key = null,
		this.Lang = null,
		this.Type = null,
		this.Name = null;
	};

	/**
	 * 打包从数据库中查询到的数据
	 * @param {Object} data 数据库的查询
	 * @returns MCItemData
	 */
	getDataFromDB(data) {
		if(data){
			this.VerMax = data.VerMax;
			this.VerMin = data.VerMin;
			this.Key = data.key;
			this.Lang = data.Lang;
			this.Type = data.Type;
			this.Name = data.Name;
		}
		return this;
	};
};


// 网络框架数据
export class Req {
	constructor() {
		this.ipac = {
			ip: '',
		};
	};
};
export class Reply {
	constructor() {
		this.type = function(){};
		this.header = function(){};
		this.send = function(){};
	};
};


// 适用于 httpApi.api.detailed 的用户输入数据类型
export class HttpPostDetailed {
	constructor() {
		this.type = '';
		this.key = '';
	};

	/**
	 * 从用户输入中获取并打包数据
	 * @param {string} _type mcType 的名称
	 * @param {string} _key MC物品ID
	 * @returns 已过滤的数据集
	 */
	setData(_type, _key) {
		// 检查
		if(_type == null || _key == null){return null;}
		this.type = `${_type}`;
		this.key = `${_key}`;
		if(MCTypeID.getID(this.type) === undefined){
			return null;
		}
		if(this.key.length <= 0){
			return null;
		}
		return this;
	}
};


// 适用于 httpApi.api.list 的用户输入数据类型
export class HttpPostList {
	constructor() {
		this.lang = '';
		this.inp = '';
	};

	setData(_lang, _inp) {
		if(_lang == null || _inp == null){
			return null;
		}
		this.lang = `${_lang}`;
		this.inp = `${_inp}`;
		if(this.inp == '' || this.inp === '=' || this.inp.length > 256 || this.lang.length > 10){
			return null;
		}
		return this;
	};
};


