// The NYT list, in published order. A show's id is its NYT rank.
export const SHOWS = [
  "Breaking Bad","The Wire","Mad Men","Succession","Fleabag","Game of Thrones","Veep","30 Rock",
  "Curb Your Enthusiasm","Atlanta","The Office (U.S.)","Arrested Development","Girls","Friday Night Lights",
  "Six Feet Under","The Office (U.K.)","The Americans","I May Destroy You","Chernobyl","The Crown",
  "The White Lotus","Lost","The Comeback","Deadwood","The Leftovers","Black Mirror","Better Call Saul",
  "Band of Brothers","Key & Peele","Severance","Survivor","Andor","Enlightened","Schitt's Creek",
  "True Detective (season 1)","The Pitt","Battlestar Galactica","Homeland","Watchmen","Adolescence","Louie",
  "Hacks","Peaky Blinders","BoJack Horseman","Happy Valley","Broad City","Twin Peaks: The Return",
  "House of Cards","Normal People","Parks and Recreation","The Good Place","Downton Abbey","Stranger Things",
  "The Bureau","Insecure","Nathan for You","I Think You Should Leave with Tim Robinson","Chappelle's Show",
  "PEN15","Peep Show","RuPaul's Drag Race","Slow Horses","The Thick of It","Anthony Bourdain: Parts Unknown",
  "Mare of Easttown","The Rehearsal","The Handmaid's Tale","Ozark","Anthony Bourdain: No Reservations",
  "The Shield","Beef","Squid Game","Barry","The Bear","Ted Lasso","Somebody Somewhere","Modern Family",
  "It's Always Sunny In Philadelphia","The Good Wife","How To With John Wilson","The Queen's Gambit",
  "Better Things","Justified","Planet Earth","The Great British Baking Show","Shogun","Reservation Dogs",
  "Dexter","Baby Reindeer","Eastbound & Down","Catastrophe","The Night Of","Station Eleven","The Diplomat",
  "House","Halt and Catch Fire","Community","The OA","Gilmore Girls","Scandal"
].map((title, i) => ({ id: i + 1, nytRank: i + 1, title }));

export const TIERS = [
  { label: "Not top 100", short: ">100" },
  { label: "81–100", short: "81–100" },
  { label: "61–80", short: "61–80" },
  { label: "41–60", short: "41–60" },
  { label: "21–40", short: "21–40" },
  { label: "1–20 (best)", short: "1–20" },
];

// The tier a show's NYT rank falls in: 1–20 is tier 5, 81–100 is tier 1.
export const nytTier = (nytRank) => 5 - Math.floor((nytRank - 1) / 20);

export const STATUSES = [
  { id: "not_watched", label: "Not watched" },
  { id: "partial", label: "Partially watched" },
  { id: "watched", label: "Watched" },
];

// The server enforces the same caps.
export const CUSTOM_ENTRY_CAP = 20;
export const KICKOUT_CAP = 20;
