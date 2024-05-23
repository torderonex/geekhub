export function processText(text: string | undefined) {
    return text?.replace(/\\n/g, '\n');
}
