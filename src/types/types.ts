export type PathSegment = string | number

export enum RepresentationSelectionEnum {
    FIRST = 'first',
    ALL = 'all',
    SELECTED = 'selected',
}

export interface RepresentationSelection {
    select: RepresentationSelectionEnum;
    paths?: PathSegment[][];
}

export interface PdfCoverPageOptions {
    logo?: string;
    title: string;
    showCarmentisSeal?: boolean;
    proofCheckerUrl?: string;
}

export interface PdfInjectedTextOptions {
    color?: string;
    bold?: boolean;
}

export interface PdfRepresentationOptions {
    select: RepresentationSelectionEnum;
    paths?: PathSegment[][];
}

export interface PdfOptions {
	representations?: PdfRepresentationOptions;
    fontRatio?: number;
    creationDate?: string;
    coverPage?: PdfCoverPageOptions;
    injectedText?: PdfInjectedTextOptions;
    language?: string;
}
