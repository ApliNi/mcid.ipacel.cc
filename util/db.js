
import Database from 'better-sqlite3';
import { logger } from './logger.js';

// 监听语句运行完成
let saveData_Lock = false;
async function db_on(sql){
	// console.log(sql);

	// 如果语句中包含写入指令
	if(/DELETE|UPDATE|INSERT/.test(sql)){
		// 定期提交数据
		if(!saveData_Lock){
			saveData_Lock = true;
			setTimeout(async () => {
				sqls.COMMIT.run(); // 提交
				sqls.BEGIN.run(); // 打开一个新的事务
				saveData_Lock = false;
				// console.log(' -- 提交完成');
			}, 7000); // 自动保存时间
		}
	}
};


// 连接数据库
const dbFile = './data/Data.sqlite3';
export let db = new Database(dbFile, {verbose: db_on});


const sqls = {
	COMMIT: db.prepare('COMMIT;'),
	BEGIN: db.prepare('BEGIN;'),
	optimize: db.prepare('PRAGMA optimize;'),
};


// 异步方法
export let AsyncDB = {
	get: (s, v = []) => new Promise(async (resolve) => {
		resolve(db.prepare(s).get(v));
	}),
	_get: (stmt, v = []) => new Promise(async (resolve) => {
		resolve(stmt.get(v));
	}),
	all: (s, v = []) => new Promise(async (resolve) => {
		resolve(db.prepare(s).all(v));
	}),
	_all: (stmt, v = []) => new Promise(async (resolve) => {
		resolve(stmt.all(v));
	}),
	_run: (stmt, v = []) => new Promise(async (resolve) => {
		resolve(stmt.run(v));
	}),
};


// 初始化数据库
await (() => {
	return new Promise(async (resolve) => {

		// 初始化数据库配置
		db.exec(`
			PRAGMA page_size = 16384;	-- 页面大小
			PRAGMA auto_vacuum = FULL;	-- 自动处理碎片
			PRAGMA journal_mode = WAL;	-- WAL 模式 or OFF
		`);

		// 初始化数据表
		db.exec(`

			-- MC 协议版本表
			CREATE TABLE IF NOT EXISTS "mcVer" (
				"pid"		INTEGER NOT NULL UNIQUE,
				"ver"		TEXT NOT NULL,

				PRIMARY KEY ("pid")
			);
			CREATE INDEX IF NOT EXISTS idx_mcVer ON mcVer (ver);


			-- MC Type表
			CREATE TABLE IF NOT EXISTS "mcType" (
				"id"		INTEGER NOT NULL,
				"type"		TEXT NOT NULL UNIQUE,

				PRIMARY KEY ("id" AUTOINCREMENT)
			);
			CREATE INDEX IF NOT EXISTS idx_mcType ON mcType (type);
			

			-- MC 物品id表
			CREATE TABLE IF NOT EXISTS "mcKey" (
				"id"		INTEGER NOT NULL,
				"key"		TEXT NOT NULL UNIQUE,

				PRIMARY KEY ("id" AUTOINCREMENT)
			);
			CREATE INDEX IF NOT EXISTS idx_mcKey ON mcKey (key);
			-- 虚拟表 & 触发器
			CREATE VIRTUAL TABLE IF NOT EXISTS mcKey_FTS USING FTS5(id, key);
			CREATE TRIGGER IF NOT EXISTS syncTrigger_INSERT_mcKey_FTS AFTER INSERT ON mcKey FOR EACH ROW BEGIN
				INSERT INTO mcKey_FTS (id, key) VALUES (NEW.id, NEW.key);
			END;
			CREATE TRIGGER IF NOT EXISTS syncTrigger_DELETE_mcKey_FTS AFTER DELETE ON mcKey FOR EACH ROW BEGIN
				DELETE FROM mcKey_FTS WHERE id = OLD.id;
			END;
			CREATE TRIGGER IF NOT EXISTS syncTrigger_UPDATE_mcKey_FTS AFTER UPDATE ON mcKey FOR EACH ROW BEGIN
				DELETE FROM mcKey_FTS WHERE id = OLD.id;
				INSERT INTO mcKey_FTS (id, key) VALUES (NEW.id, NEW.key);
			END;


			-- MC 物品名称表
			CREATE TABLE IF NOT EXISTS "mcName" (
				"id"		INTEGER NOT NULL,
				"name"		TEXT NOT NULL UNIQUE,

				PRIMARY KEY ("id" AUTOINCREMENT)
			);
			CREATE INDEX IF NOT EXISTS idx_mcName ON mcName (name);
			-- 虚拟表 & 触发器
			CREATE VIRTUAL TABLE IF NOT EXISTS mcName_FTS USING FTS5(id, name);
			CREATE TRIGGER IF NOT EXISTS syncTrigger_INSERT_mcName_FTS AFTER INSERT ON mcName FOR EACH ROW BEGIN
				INSERT INTO mcName_FTS (id, name) VALUES (NEW.id, NEW.name);
			END;
			CREATE TRIGGER IF NOT EXISTS syncTrigger_DELETE_mcName_FTS AFTER DELETE ON mcName FOR EACH ROW BEGIN
				DELETE FROM mcName_FTS WHERE id = OLD.id;
			END;
			CREATE TRIGGER IF NOT EXISTS syncTrigger_UPDATE_mcName_FTS AFTER UPDATE ON mcName FOR EACH ROW BEGIN
				DELETE FROM mcName_FTS WHERE id = OLD.id;
				INSERT INTO mcName_FTS (id, name) VALUES (NEW.id, NEW.name);
			END;


			-- 语言代码表
			CREATE TABLE IF NOT EXISTS "lang" (
				"id"		INTEGER NOT NULL,
				"lang"		TEXT NOT NULL UNIQUE,

				PRIMARY KEY ("id" AUTOINCREMENT)
			);
			CREATE INDEX IF NOT EXISTS idx_lang ON lang (lang);


			-- MC 物品id表
			CREATE TABLE IF NOT EXISTS "data" (
				"id"		INTEGER NOT NULL,
				"Lang"		INTEGER NOT NULL,	-- 语言
				"Type"		INTEGER NOT NULL,	-- 类型
				"key"		INTEGER NOT NULL,	-- 物品id
				"Name"		INTEGER NOT NULL,	-- 物品名称
				"VerMin"	INTEGER NOT NULL,	-- 最小版本
				"VerMax"	INTEGER NOT NULL,	-- 最大版本

				FOREIGN KEY ("Lang")	REFERENCES lang		("id") ON DELETE SET NULL ON UPDATE NO ACTION,
				FOREIGN KEY ("Type")	REFERENCES mcType	("id") ON DELETE SET NULL ON UPDATE NO ACTION,
				FOREIGN KEY ("key")		REFERENCES mcKey	("id") ON DELETE SET NULL ON UPDATE NO ACTION,
				FOREIGN KEY ("Name")	REFERENCES mcName	("id") ON DELETE SET NULL ON UPDATE NO ACTION,
				FOREIGN KEY ("VerMin")	REFERENCES mcVer	("pid") ON DELETE SET NULL ON UPDATE NO ACTION,
				FOREIGN KEY ("VerMax")	REFERENCES mcVer	("pid") ON DELETE SET NULL ON UPDATE NO ACTION,
				PRIMARY KEY ("id" AUTOINCREMENT)
			);
			CREATE UNIQUE INDEX IF NOT EXISTS idx_data_UNIQUE ON data (Lang, Type, Key, Name);
			CREATE INDEX IF NOT EXISTS idx_data ON data (Lang, Key, Name);
			CREATE INDEX IF NOT EXISTS idx_data_name ON data (Name);


			-- 查询缓存表, 保存查询过的数据
			CREATE TABLE IF NOT EXISTS "listQueryTemp" (
				"id"		INTEGER NOT NULL,
				"lang"		INTEGER NOT NULL,
				"text"		TEXT NOT NULL,
				"ver"		INTEGER NOT NULL,
				"num"		INTEGER NOT NULL,
				"data"		TEXT NOT NULL,

				PRIMARY KEY ("id" AUTOINCREMENT)
			);
			CREATE UNIQUE INDEX IF NOT EXISTS idx_listQueryTemp_UNIQUE ON listQueryTemp (lang, text, ver);

		`);
		// 结束
		resolve();

	});
})();



// 开启事务
sqls.BEGIN.run();
logger.mark('数据库加载完成');


// 关闭事件
process.on('SIGINT', async () => {
	logger.warn('强制关闭');
	logger.info('  - 正在关闭数据库');

	sqls.COMMIT.run();
	sqls.optimize.run();
	db.close();
	logger.info('已关闭数据库');
	process.exit(0);
});

// 结束事件
process.on('beforeExit', async () => {
	logger.info('运行完成');

	sqls.COMMIT.run();
	sqls.optimize.run();
	db.close();
	logger.info('已关闭数据库');
	process.exit(0);
});


