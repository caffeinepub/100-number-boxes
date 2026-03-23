import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Entry {
    bSection: Array<bigint>;
    date: Time;
    game: string;
    cuttingAmount: bigint;
    multiplyValue: bigint;
    numbers: Array<bigint>;
    party: string;
    cuttingType: bigint;
    aSection: Array<bigint>;
    cuttingPercentage: bigint;
}
export type Time = bigint;
export interface backendInterface {
    deleteData(date: Time, game: string, party: string): Promise<void>;
    getAllData(): Promise<Array<Entry>>;
    getDataByDate(date: Time): Promise<Array<Entry>>;
    getDataByParty(party: string): Promise<Array<Entry>>;
    saveData(date: Time, game: string, party: string, numbers: Array<bigint>, bSection: Array<bigint>, aSection: Array<bigint>, cuttingType: bigint, cuttingAmount: bigint, cuttingPercentage: bigint, multiplyValue: bigint): Promise<void>;
}
