import { requestUrl } from 'obsidian';
import { VaultMindSettings } from './settings';

export async function callDeepSeek(prompt: string, settings: VaultMindSettings): Promise<any> {
	const { apiKey, baseUrl, model } = settings;

	if (!apiKey) {
		throw new Error('DeepSeek API Key is not set.');
	}

	const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

	const payload = {
		model: model,
		messages: [
			{ role: "system", content: "You are a helpful assistant that outputs JSON only." },
			{ role: "user", content: prompt }
		],
		response_format: { type: "json_object" }
	};

	const response = await requestUrl({
		url: url,
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});

	if (response.status !== 200) {
		throw new Error(`DeepSeek API error: ${response.status} ${response.text}`);
	}

	const result = response.json;
	const content = result.choices[0].message.content;
	return JSON.parse(content);
}
