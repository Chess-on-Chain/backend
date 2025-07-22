import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface HttpHeader { 'value' : string, 'name' : string }
export interface HttpResponse {
  'status' : bigint,
  'body' : Uint8Array | number[],
  'headers' : Array<HttpHeader>,
}
export interface HttpTransformArgs {
  'context' : Uint8Array | number[],
  'response' : HttpResponse,
}
export interface Match {
  'id' : string,
  'fen' : string,
  'moves' : Array<Move>,
  'timer' : [] | [bigint],
  'time' : bigint,
  'winner' : string,
  'is_ranked' : boolean,
  'black_player' : Principal,
  'white_player' : Principal,
  'is_white_turn' : boolean,
}
export interface MatchResult {
  'id' : string,
  'fen' : string,
  'moves' : Array<Move>,
  'winner' : string,
  'is_ranked' : boolean,
  'black_player' : User,
  'white_player' : User,
}
export interface MatchResultHistory {
  'id' : string,
  'fen' : string,
  'moves' : Array<Move>,
  'winner' : string,
  'is_ranked' : boolean,
  'black_player' : Principal,
  'white_player' : Principal,
}
export interface Move {
  'time' : bigint,
  'to_position' : string,
  'from_position' : string,
}
export interface Player {
  'signature' : string,
  'expired' : number,
  'pubkey' : string,
}
export interface User {
  'id' : Principal,
  'win' : number,
  'draw' : number,
  'lost' : number,
  'is_banned' : boolean,
}
export interface _SERVICE {
  'accept_ownership' : ActorMethod<[], undefined>,
  'add_match' : ActorMethod<[Player, Player, boolean], Match>,
  'add_match_move' : ActorMethod<[string, string, string, string], Match>,
  'ban' : ActorMethod<[Principal], undefined>,
  'change_webhook_url' : ActorMethod<[string], undefined>,
  'get_caller_match' : ActorMethod<[], [] | [MatchResult]>,
  'get_histories' : ActorMethod<
    [Principal, number, number],
    Array<MatchResultHistory>
  >,
  'get_match' : ActorMethod<[string], MatchResult>,
  'get_user' : ActorMethod<[Principal], [] | [User]>,
  'initialize' : ActorMethod<[Principal, Principal, string], undefined>,
  'resign' : ActorMethod<[], undefined>,
  'transfer_ownership' : ActorMethod<[Principal], undefined>,
  'unban' : ActorMethod<[Principal], undefined>,
  'webhook_transform' : ActorMethod<[HttpTransformArgs], HttpResponse>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
