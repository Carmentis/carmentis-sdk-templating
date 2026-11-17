import { InjectionCodec } from "./InjectionCodec";
import { LiquidProcessor } from "./LiquidProcessor";
import {
    ResolverPath,
    Path,
    Representation,
    RepresentationTemplateEngine,
    RepresentationFormat,
} from '@cmts-dev/carmentis-sdk-core';

export enum RepresentationSelectionEnum {
    FIRST = 'first',
    ALL = 'all',
    SELECTED = 'selected',
}

export interface RepresentationSelection {
    select: RepresentationSelectionEnum;
    paths?: Path[];
}

export class RepresentationProcessor {
    static async toMarkdown(rootObject: Record<any, any>, representations: Map<string, Representation>, selection: RepresentationSelection) {
        const codec = new InjectionCodec;
        const liquidProcessor = new LiquidProcessor(codec);
        const markdownList: string[] = [];
        let isFirst = true;

        for (const [ serializedPath, representation ] of representations) {
            const resolverPath = ResolverPath.fromSerialized(serializedPath).removeLast();
            const representationPath = resolverPath.getPath();
            if (selection.select === RepresentationSelectionEnum.FIRST && !isFirst) {
                break;
            }
            if (
                selection.select === RepresentationSelectionEnum.SELECTED &&
                !RepresentationProcessor.isMatchingPath(selection.paths ?? [], representationPath)
            ) {
                continue;
            }
            if (representation.templateEngine !== RepresentationTemplateEngine.LIQUID) {
                throw new Error(`unsupported template engine '${representation.templateEngine}'`);
            }
            if (representation.format !== RepresentationFormat.MARKDOWN) {
                throw new Error(`unsupported format '${representation.format}'`);
            }
            if (representation.relativePath !== undefined) {
                resolverPath.join(representation.relativePath);
            }
            const object = resolverPath.applyToData(rootObject);
            const markdown = await liquidProcessor.render(representation.template, object);
            markdownList.push(markdown);
            isFirst = false;
        }
        return markdownList.join("\n---\n");
    }

    private static isMatchingPath(selectionPaths: Path[], representationPath: Path) {
        return selectionPaths.some((path) =>
            representationPath.length === path.length &&
            representationPath.every((item, i) => item === path[i])
        )
    }
}
