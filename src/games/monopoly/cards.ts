import type { MatchEventCard } from "./types";
import { RED_CARD_INDEX } from "./board";

/**
 * Football-themed "Chance" cards.
 * Drawn whenever a player lands on a "Матч-событие" tile.
 */
export const MATCH_EVENT_CARDS: MatchEventCard[] = [
  {
    id: "var_undo",
    title: "VAR пересмотр",
    titleEn: "VAR review",
    body: "Арбитр отменяет твою последнюю покупку — деньги возвращаются, страна снова свободна.",
    bodyEn: "The referee overturns your last purchase — refund issued, the country is free again.",
    effect: { type: "var_undo_last_purchase" },
  },
  {
    id: "goal_90plus",
    title: "Гол на 90+ минуте!",
    titleEn: "Goal in 90+!",
    body: "Победный гол в добавленное время. Болельщики платят бонус $150.",
    bodyEn: "Winner in stoppage time. Fans tip you $150.",
    effect: { type: "cash", amount: 150 },
  },
  {
    id: "ticket_sales",
    title: "Аншлаг на стадионе",
    titleEn: "Sold-out stadium",
    body: "Все билеты раскуплены. Получаешь $200 от FIFA.",
    bodyEn: "Every seat sold. FIFA pays you $200.",
    effect: { type: "cash", amount: 200 },
  },
  {
    id: "sponsorship",
    title: "Контракт со спонсором",
    titleEn: "Sponsor deal",
    body: "Ты подписал контракт с глобальным брендом. +$300.",
    bodyEn: "Signed a global sponsor deal. +$300.",
    effect: { type: "cash", amount: 300 },
  },
  {
    id: "injury",
    title: "Травма звезды",
    titleEn: "Star injury",
    body: "Ключевой игрок выбыл — трансферный штраф $100.",
    bodyEn: "Key player out — transfer penalty $100.",
    effect: { type: "cash", amount: -100 },
  },
  {
    id: "fifa_fine",
    title: "Штраф от FIFA",
    titleEn: "FIFA fine",
    body: "Команда нарушила протокол. Заплати $150.",
    bodyEn: "Team broke protocol. Pay $150.",
    effect: { type: "cash", amount: -150 },
  },
  {
    id: "red_card_send_off",
    title: "Прямая красная!",
    titleEn: "Straight red!",
    body: "Грубый фол. Отправляйся на красную карточку.",
    bodyEn: "Reckless foul. Off to the red card.",
    effect: { type: "go_to_red_card" },
  },
  {
    id: "kickoff_back",
    title: "Возврат к центру поля",
    titleEn: "Back to centre",
    body: "Возвращайся на KICK-OFF и собери $200.",
    bodyEn: "Go back to KICK-OFF and collect $200.",
    effect: { type: "move", toIndex: 0, collectKickoff: true },
  },
  {
    id: "press_back_3",
    title: "Прессинг — 3 шага назад",
    titleEn: "Press — back 3",
    body: "Соперник отбирает мяч. Сделай 3 шага назад.",
    bodyEn: "Opponent presses. Move 3 spaces back.",
    effect: { type: "move_relative", delta: -3 },
  },
  {
    id: "fast_break",
    title: "Контратака",
    titleEn: "Fast break",
    body: "Быстрый прорыв! Сделай 5 шагов вперёд.",
    bodyEn: "Quick counter — move 5 spaces forward.",
    effect: { type: "move_relative", delta: 5 },
  },
  {
    id: "extra_time",
    title: "Дополнительное время",
    titleEn: "Extra time",
    body: "Следующий бросок будет двойным.",
    bodyEn: "Your next dice roll counts double.",
    effect: { type: "double_dice_next_roll" },
  },
  {
    id: "yellow_warn",
    title: "Жёлтая карточка",
    titleEn: "Yellow card",
    body: "Только предупреждение — пропускаешь следующий ход.",
    bodyEn: "Just a warning — skip your next turn.",
    effect: { type: "skip_next_turn" },
  },
  {
    id: "trophy_share",
    title: "Победа над всеми",
    titleEn: "Crowd-pleaser",
    body: "Каждый соперник платит тебе по $50 за зрелище.",
    bodyEn: "Each opponent pays you $50 for the show.",
    effect: { type: "collect_each_player", amount: 50 },
  },
  {
    id: "hooligan_fine",
    title: "Беспорядки болельщиков",
    titleEn: "Crowd trouble",
    body: "Заплати каждому сопернику по $40 — компенсация.",
    bodyEn: "Pay each opponent $40 in compensation.",
    effect: { type: "pay_each_player", amount: 40 },
  },
  {
    id: "to_red_card_direct",
    title: "Удаление до конца матча",
    titleEn: "Sent off",
    body: "Иди на красную карточку без сбора $200.",
    bodyEn: "Off to the red card. Do not collect $200.",
    effect: { type: "go_to_red_card" },
  },
];

export const RED_CARD_TILE = RED_CARD_INDEX; // re-export for convenience
