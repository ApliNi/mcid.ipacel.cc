
const lang = {
	'mcType.biome': '生物群系',
	'mcType.block': '方块',
	'mcType.enchantment': '附魔',
	'mcType.entity': '实体',
	'mcType.item': '物品',
	'mcType.color': '颜色',
	'mcType.effect': '效果',
	'mcType.event': '事件',
	'mcType.flat_world_preset': '平面世界预设',
	'mcType.generator': '生成器',
	'mcType.instrument': '音效',
	'mcType.stat': '统计数据',
	'mcType.stat_type': '统计数据类型',
	'mcType.trim_material': '装饰材料',
	'mcType.trim_pattern': '装饰图案',
	'mcType.upgrade': '升级',
	
	'img.notImg': '没有图片',
	'load.ok': '加载 %1 条数据, 耗时 %2 %3',
	'load.ing': '正在加载...',
	'load.awaitInput': '等待输入...',
	'time.ms': '毫秒',
	'time.s': '秒',
	'click_copy': '点击复制: %1',
	'info.motd.type': '类型: %1',
	'info.motd.ver': '版本: %1',
	'info.motd.lang': '语言: %1',
	'info.motd.lang.other': '及其他 %1 种语言',
	'info.motd.alias': '别名<span class="fs14px">[%1]</span>: %2',
	'list.null': '什么都没找到...',
	'detailed.lang': '语言 [共 %1 种]',
	'btn.wiki': '维基',
	'btn.detailed.title': '展开详细信息',

	'welcome': `
		[MCID] <a href="https://mcid.ipacel.cc/">https://mcid.ipacel.cc/</a>
		<div class="br">
			Minecraft 命名空间查询页. 支持查询 1.13 ~ 1.20 版本中 \`物品, 方块, 实体, 生物群系, 附魔\` 等类型下各种数据的不同语言和别名.
		</div>

		<br><br>[QUERY]
		<div class="br">
			仅查询ID: \`={Text}\`, 测试: <a onclick="runQuery('=apple')">\`=apple\`</a>
		</div>
		
		<br><br>[CONFIG]
		<div class="br">
			修改语言: \`/?<span class="highlight -all">l={Lang}</span>\`. 测试:
			<a href="/?l=en-US" title="/?l=en-US">[en-US]</a>,
			<a href="/?l=zh-CN" title="/?l=zh-CN">[zh-CN]</a>
			<br>
			填充输入框: \`/?<span class="highlight -all">q={Text}</span>\`.
			<a href="/?q=苦力怕" title="/?q=苦力怕">测试</a>
		</div>
		
		<br><br>[OPEN_API]
		<div class="br">
			查询列表: \`/api.list/?<span class="highlight -all">l={Lang}</span>&<span class="highlight -all">q={Text}</span>\`.
			<a href="/api.list/?l=zh_cn&q=苦力怕" title="https://mcid.ipacel.cc/api.list/?l=zh_cn&q=苦力怕">测试</a>
			<br>
			详细信息: \`/api.detailed/?<span class="highlight -all">t={Type}</span>&<span class="highlight -all">k={ID}</span>\`.
			<a href="/api.detailed/?t=entity&k=creeper" title="https://mcid.ipacel.cc/api.detailed/?t=entity&k=creeper">测试</a>
			<br>
			&nbsp;&nbsp;- {Type}: \`block, biome, item, entity, enchantment\`
		</div>
	`,
};
