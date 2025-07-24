export const idlFactory = ({ IDL }) => {
  const Move = IDL.Record({
    'time' : IDL.Nat64,
    'to_position' : IDL.Text,
    'from_position' : IDL.Text,
  });
  const Match = IDL.Record({
    'id' : IDL.Text,
    'fen' : IDL.Text,
    'moves' : IDL.Vec(Move),
    'timer' : IDL.Opt(IDL.Nat64),
    'time' : IDL.Nat64,
    'winner' : IDL.Text,
    'is_ranked' : IDL.Bool,
    'black_player' : IDL.Principal,
    'white_player' : IDL.Principal,
    'is_white_turn' : IDL.Bool,
  });
  const User = IDL.Record({
    'id' : IDL.Principal,
    'win' : IDL.Nat32,
    'draw' : IDL.Nat32,
    'lost' : IDL.Nat32,
    'is_banned' : IDL.Bool,
  });
  const MatchResult = IDL.Record({
    'id' : IDL.Text,
    'fen' : IDL.Text,
    'moves' : IDL.Vec(Move),
    'winner' : IDL.Text,
    'is_ranked' : IDL.Bool,
    'black_player' : User,
    'white_player' : User,
  });
  const MatchResultHistory = IDL.Record({
    'id' : IDL.Text,
    'fen' : IDL.Text,
    'moves' : IDL.Vec(Move),
    'winner' : IDL.Text,
    'is_ranked' : IDL.Bool,
    'black_player' : IDL.Principal,
    'white_player' : IDL.Principal,
  });
  const HttpHeader = IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text });
  const HttpResponse = IDL.Record({
    'status' : IDL.Nat,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HttpHeader),
  });
  const HttpTransformArgs = IDL.Record({
    'context' : IDL.Vec(IDL.Nat8),
    'response' : HttpResponse,
  });
  return IDL.Service({
    'accept_ownership' : IDL.Func([], [], []),
    'add_match' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Bool],
        [Match],
        [],
      ),
    'add_match_move' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [Match],
        [],
      ),
    'ban' : IDL.Func([IDL.Principal], [], []),
    'change_webhook_url' : IDL.Func([IDL.Text], [], []),
    'get_caller_match' : IDL.Func([], [IDL.Opt(MatchResult)], ['query']),
    'get_histories' : IDL.Func(
        [IDL.Principal, IDL.Nat16, IDL.Nat16],
        [IDL.Vec(MatchResultHistory)],
        ['query'],
      ),
    'get_login' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
    'get_match' : IDL.Func([IDL.Text], [MatchResult], ['query']),
    'get_user' : IDL.Func([IDL.Principal], [IDL.Opt(User)], ['query']),
    'initialize' : IDL.Func([IDL.Principal, IDL.Principal, IDL.Text], [], []),
    'login' : IDL.Func([IDL.Text], [], []),
    'resign' : IDL.Func([], [], []),
    'transfer_ownership' : IDL.Func([IDL.Principal], [], []),
    'unban' : IDL.Func([IDL.Principal], [], []),
    'webhook_transform' : IDL.Func(
        [HttpTransformArgs],
        [HttpResponse],
        ['query'],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
