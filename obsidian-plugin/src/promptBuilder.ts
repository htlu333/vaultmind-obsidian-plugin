import { SourceType } from './types';

export function buildNotePrompt(content: string, existingTags: string[] = []): string {
	const tagContext = existingTags.length > 0 
		? `\n    目前已有的知识主题(MOC)包括: ${existingTags.join(', ')}。如果内容匹配，请优先从这些主题中选择作为标签。`
		: "";

	return `
    你是一个专业的知识管理助手。请分析以下笔记内容，并提供摘要、标签和关联建议。${tagContext}
    
    内容:
    ${content}
    
    请以 JSON 格式提供输出，结构如下：
    {
      "vm_summary": "3-5 句的笔记核心摘要（简体中文）。",
      "vm_content_tags": ["标签1", "标签2"],
      "vm_file_tags": ["知识点", "思考", "问题", 或 "摘录"],
      "vm_related_notes": ["建议的相关主题1", "建议的相关主题2"]
    }
    注意（学术标签规范）：
    1. 所有内容必须使用简体中文。
    2. vm_content_tags 必须是学术常用概念或专业术语，能在标题或摘要中找到语义依据。
    3. 标签必须短、稳定、可复用，优先输出 1-3 个。禁止生造为了当前文档临时拟合的标签。
    4. 避免使用过泛的词，如“研究”“学习”“方法”这类空泛标签。
    5. 如果内容无法确定高质量学术标签，请输出空数组 []。
    6. vm_file_tags 必须从提供的选项中选择。
    `;
}

export function buildPaperPrompt(content: string, extracted: { abstract?: string; keywords?: string[] }, existingTags: string[] = []): string {
	const abstract = extracted.abstract || '未找到。';
	const keywords = extracted.keywords ? extracted.keywords.join(', ') : '未找到。';
	const tagContext = existingTags.length > 0 
		? `\n    目前已有的知识主题(MOC)包括: ${existingTags.join(', ')}。如果内容匹配，请优先从这些主题中选择作为标签。`
		: "";

	return `
    你是一个专业的学术助手。请分析以下论文内容，并提供摘要、标签和关联建议。${tagContext}
    
    论文内容:
    ${content}
    
    提取的摘要:
    ${abstract}
    
    提取的关键词:
    ${keywords}
    
    请以 JSON 格式提供输出，结构如下：
    {
      "vm_summary": "3-5 句的论文核心摘要（简体中文）。优先参考提取的摘要。",
      "vm_content_tags": ["关键词1", "关键词2"],
      "vm_file_tags": ["论文"],
      "vm_related_notes": ["建议的相关主题1", "建议的相关主题2"]
    }
    注意（学术标签规范）：
    1. 所有内容必须使用简体中文。
    2. vm_content_tags 优先对齐原文关键词，但必须转换为标准学术术语。
    3. 标签必须短、稳定、可复用，优先输出 1-3 个。禁止生造拟合标签。
    4. 避免使用过泛的词，如“研究”“分析”等。
    `;
}

export function buildExcerptPrompt(content: string, existingTags: string[] = []): string {
	const tagContext = existingTags.length > 0 
		? `\n    目前已有的知识主题(MOC)包括: ${existingTags.join(', ')}。如果内容匹配，请优先从这些主题中选择作为标签。`
		: "";

	return `
    你是一个专业的知识管理助手。请分析以下摘录内容，并提供摘要、标签和关联建议。${tagContext}
    
    摘录内容:
    ${content}
    
    请以 JSON 格式提供输出，结构如下：
    {
      "vm_summary": "3-5 句的摘录核心摘要（简体中文）。强调这是一个摘录。",
      "vm_content_tags": ["标签1", "标签2"],
      "vm_file_tags": ["摘录"],
      "vm_related_notes": ["建议的相关主题1", "建议的相关主题2"]
    }
    注意（学术标签规范）：
    1. 所有内容必须使用简体中文。
    2. vm_content_tags 必须是标准学术或专业概念，保持精简（1-3 个）。禁止生造标签。
    3. 优先输出可复用的核心术语。
    `;
}
