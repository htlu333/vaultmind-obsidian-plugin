import { SourceType } from './types';

export function detectSourceType(content: string, metadata: any): SourceType {
	// 1. Explicit source type
	if (metadata && metadata.vm_source_type) {
		if (Object.values(SourceType).includes(metadata.vm_source_type as SourceType)) {
			return metadata.vm_source_type as SourceType;
		}
	}

	const contentLower = content.toLowerCase();

	// 2. Check for paper signs
	const paperKeywords = [/\babstract\b/, /\bkeywords\b/, /\breferences\b/, /\bintroduction\b/];
	if (paperKeywords.some(regex => regex.test(contentLower))) {
		return SourceType.PAPER;
	}

	// 3. Check for excerpt signs
	const excerptKeywords = [/\bexcerpt from\b/, /\bsource:\b/, /\bquoted from\b/];
	if (excerptKeywords.some(regex => regex.test(contentLower))) {
		return SourceType.EXCERPT;
	}

	// 4. Default to note
	return SourceType.NOTE;
}

export function extractPaperMetadata(content: string): { abstract?: string; keywords?: string[] } {
	const extracted: { abstract?: string; keywords?: string[] } = {};

	// Simple regex-based extraction for Abstract
	const abstractMatch = content.match(/#*\s*Abstract\s*\n+([\s\S]*?)(?=\n+#|\n+\w+\s*\n|$)/i);
	if (abstractMatch) {
		extracted.abstract = abstractMatch[1].trim();
	}

	// Simple regex-based extraction for Keywords
	const keywordsMatch = content.match(/#*\s*Keywords\s*:\s*(.*?)(?=\n|$)/i);
	if (keywordsMatch) {
		extracted.keywords = keywordsMatch[1].split(',').map(kw => kw.trim());
	}

	return extracted;
}
