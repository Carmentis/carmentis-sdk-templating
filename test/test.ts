import { LiquidProcessor } from '../src/templates/LiquidProcessor';
import { MarkdownProcessor } from '../src/templates/MarkdownProcessor';
import { InjectionCodec } from '../src/templates/InjectionCodec';

(async function() {
    const codec = new InjectionCodec;
    const liquidProcessor = new LiquidProcessor(codec);
    const template = "## Hello {{ name }}!\nHow are you doing?";
    const data = { name: "John" };
    const markdown = await liquidProcessor.render(template, data);
    const markdownProcessor = new MarkdownProcessor(codec);
    const tokens = markdownProcessor.parse(markdown);
    const html = markdownProcessor.renderHtml(tokens);
    console.log(html);
})();
