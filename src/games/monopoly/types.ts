/**
 * FIFA Monopoly — type definitions.
 */

/** A single tile on the 40-square board. */
export type TileKind =
  | "kickoff"      // GO — corner, +$200 on pass
  | "country"      // buyable property
  | "stadium"      // railroad equivalent
  | "broadcaster"  // utility equivalent
  | "chance"       // match event card
  | "yellow_card"  // small fine
  | "red_card_jail"// jail corner
  | "half_time"    // free parking corner
  | "go_to_red"    // go-to-jail corner
  | "tax";         // FIFA fine (income/luxury tax)

export interface BaseTile {
  index: number;          // 0..39
  kind: TileKind;
  label: string;          // display label
  labelEn?: string;
}

export interface CountryTile extends BaseTile {
  kind: "country";
  groupLetter: string;    // "A".."H" — Monopoly color group
  fifaCode: string;       // "BRA", "FRA" etc
  price: number;
  rent: [number, number, number, number, number, number]; // base, 1 base, 2 bases, training base+stadium etc
  buildCost: number;      // cost per training base / stadium upgrade
  mortgageValue: number;
}

export interface StadiumTile extends BaseTile {
  kind: "stadium";
  price: 200;
  // rent depends on how many stadiums the owner has: 25/50/100/200
}

export interface BroadcasterTile extends BaseTile {
  kind: "broadcaster";
  price: 150;
}

export interface TaxTile extends BaseTile {
  kind: "tax";
  amount: number;
}

export type Tile =
  | BaseTile
  | CountryTile
  | StadiumTile
  | BroadcasterTile
  | TaxTile;

export type Avatar = "ball" | "captain" | "gloves" | "trophy" | "whistle";

export interface Player {
  id: string;             // "p0", "p1", ...
  name: string;
  avatar: Avatar;
  color: string;          // hex
  cash: number;
  position: number;       // 0..39
  ownedTileIndices: number[];
  /** index of red-card jail tile when player is "in" red card */
  inRedCard: boolean;
  redCardTurnsLeft: number;   // 0..3
  bankrupt: boolean;
  isBot: boolean;
}

/** What happened on the most recent landing — drives the modal/log. */
export type LandingEvent =
  | { kind: "buyable"; tileIndex: number; price: number }
  | { kind: "rent_paid"; tileIndex: number; from: string; to: string; amount: number }
  | { kind: "owned_self"; tileIndex: number }
  | { kind: "card_drawn"; cardId: string; effectText: string }
  | { kind: "tax"; amount: number }
  | { kind: "red_card"; reason: string }
  | { kind: "kickoff_pass"; bonus: number }
  | { kind: "neutral" };

/** A drawn match-event card. */
export interface MatchEventCard {
  id: string;
  title: string;
  titleEn: string;
  body: string;
  bodyEn: string;
  /** Effect kind for the engine to apply. */
  effect:
    | { type: "cash"; amount: number }                     // gain or lose
    | { type: "move"; toIndex: number; collectKickoff: boolean }
    | { type: "move_relative"; delta: number }
    | { type: "go_to_red_card" }
    | { type: "skip_next_turn" }
    | { type: "double_dice_next_roll" }
    | { type: "pay_each_player"; amount: number }
    | { type: "collect_each_player"; amount: number }
    | { type: "var_undo_last_purchase" };
}

export type GamePhase =
  | "setup"
  | "rolling"           // animated dice
  | "moving"            // animated token movement
  | "landed_decision"   // player needs to act on the tile they landed on
  | "auction"           // someone declined to buy → auction
  | "trade"
  | "ended";            // game over (1 player left)

export interface AuctionState {
  tileIndex: number;
  currentBid: number;
  highestBidderId: string | null;
  remainingBidderIds: string[];   // who can still bid
}
