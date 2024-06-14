
const lang = {
	'mcType.biome': 'Biome',
	'mcType.block': 'Block',
	'mcType.enchantment': 'Enchantment',
	'mcType.entity': 'Entity',
	'mcType.item': 'Item',
	'mcType.color': 'Color',
	'mcType.effect': 'Effect',
	'mcType.event': 'Event',
	'mcType.flat_world_preset': 'Flat world preset',
	'mcType.generator': 'Generator',
	'mcType.instrument': 'Instrument',
	'mcType.stat': 'Stat',
	'mcType.stat_type': 'Stat Type',
	'mcType.trim_material': 'Trim material',
	'mcType.trim_pattern': 'Trim pattern',
	'mcType.upgrade': 'Upgrade',

	'img.notImg': 'No picture',
	'load.ok': 'Loading %1 data takes %2%3',
	'load.ing': 'Loading...',
	'load.awaitInput': 'Wait for your input...',
	'time.ms': 'ms',
	'time.s': 's',
	'click_copy': 'Click to copy: %1',
	'info.motd.type': 'Type: %1',
	'info.motd.ver': 'Version: %1',
	'info.motd.lang': 'Language: %1',
	'info.motd.lang.other': 'And %1 other languages',
	'info.motd.alias': 'Alias<span class="fs14px">[%1]</span>: %2',
	'list.null': 'Found nothing...',
	'detailed.lang': 'Languages [%1 total]',
	'btn.wiki': 'WIKI',
	'btn.detailed.title': 'Open details',

	'welcome': `
		[MCID] <a href="https://mcid.ipacel.cc/">https://mcid.ipacel.cc/</a>
		<div class="br">
			Minecraft namespace lookup page. Supports querying different languages and aliases for data of types \`Items, Boxes, Entities, Biomes, Enchantments\` in versions 1.13 ~ 1.20.
		</div>

		<br><br>[QUERY]
		<div class="br">
			Query ID only: \`={Text}\`, 测试: <a onclick="runQuery('=apple')">\`=apple\`</a>
		</div>
		
		<br><br>[CONFIG]
		<div class="br">
			Set language: \`/?<span class="highlight -all">l={Lang}</span>\`. 测试:
			<a href="/?l=zh-CN" title="/?l=zh-CN">[zh-CN]</a>,
			<a href="/?l=en-US" title="/?l=en-US">[en-US]</a>
			<br>
			Fill input box: \`/?<span class="highlight -all">q={Text}</span>\`.
			<a href="/?q=Creeper" title="/?q=Creeper">测试</a>
		</div>
		
		<br><br>[OPEN_API]
		<div class="br">
			Query list: \`/api.list/?<span class="highlight -all">l={Lang}</span>&<span class="highlight -all">q={Text}</span>\`.
			<a href="/api.list/?l=en_au&q=苦力怕" title="https://mcid.ipacel.cc/api.list/?l=en_au&q=Creeper">测试</a>
			<br>
			Get details: \`/api.detailed/?<span class="highlight -all">t={Type}</span>&<span class="highlight -all">k={ID}</span>\`.
			<a href="/api.detailed/?t=entity&k=creeper" title="https://mcid.ipacel.cc/api.detailed/?t=entity&k=creeper">测试</a>
			<br>
			&nbsp;&nbsp;- {Type}: \`block, biome, item, entity, enchantment\`
		</div>
	`,
};
