import { db } from "../util/db.js";
import { logger } from "../util/logger.js";
import { MCProtocolVersion } from "../util/mcVer.js";

const sql_addVer = db.prepare('INSERT OR IGNORE INTO mcVer (pid, ver) VALUES (?, ?);');

// 遍历版本json
for(const verName in MCProtocolVersion._vers){
	const pid = MCProtocolVersion._vers[verName];

	// logger.info(`${pid} -> ${verName}`);

	sql_addVer.run([pid, verName]);
}

logger.mark('[TOOL.getVer] 版本导入完成');
