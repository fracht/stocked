export type StockProxy<In, Out> = MappingProxy | FunctionProxy<In, Out>;

export type MappingProxy = {
    input: string;
    output: string;
    map: Record<string, string>;
};

export type FunctionProxy<In, Out> = {
    input: string;
    output: string;
    get: (input: In) => Out;
    set: (value: unknown, path: string, setInnerValue: (name: string, value: unknown) => void) => void;
};
