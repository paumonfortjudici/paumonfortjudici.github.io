// Generated from public/works/spelled-guilty/manifest.json (file names, sizes, case data). Do not hand-edit paths.
// Nothing here names a culprit, a hidden message, a hint or a solution.

export const BASE = '/works/spelled-guilty'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface ImageRef {
  file: string
  w: number
  h: number
}

export const COVER = {
  front: { file: "cover-front.webp", w: 933, h: 1400 },
  back: { file: "cover-back.webp", w: 933, h: 1400 },
  spine: { file: "cover-spine.webp", w: 75, h: 1400 },
} as const

export interface FlipPageData extends ImageRef {
  /** printed page number in the 214-page book */
  n: number
  label: string
  kind: 'front-matter' | 'case-file' | 'case-grid'
  alt: string
  case?: number
}

export const FLIP_PAGES: FlipPageData[] = [
  {"file": "pages/p001-title.webp", "w": 900, "h": 1350, "n": 1, "label": "Title page", "kind": "front-matter", "alt": "Page 1 of the book: Title page."},
  {"file": "pages/p003-how-to-solve.webp", "w": 900, "h": 1350, "n": 3, "label": "How to solve a case", "kind": "front-matter", "alt": "Page 3 of the book: How to solve a case."},
  {"file": "pages/p004-scorecard-01-25.webp", "w": 900, "h": 1350, "n": 4, "label": "Detective's scorecard, cases 01-25", "kind": "front-matter", "alt": "Page 4 of the book: Detective's scorecard, cases 01-25."},
  {"file": "pages/p005-scorecard-26-50.webp", "w": 900, "h": 1350, "n": 5, "label": "Detective's scorecard, cases 26-50", "kind": "front-matter", "alt": "Page 5 of the book: Detective's scorecard, cases 26-50."},
  {"file": "pages/p008-case-01-file.webp", "w": 900, "h": 1350, "n": 8, "label": "Case file 01: Murder at Gull Rock", "kind": "case-file", "alt": "Case file 01 'Murder at Gull Rock' (Gull Rock Lighthouse, Cornwall, 1923): the story, four illustrated suspects A to D and their descriptions.", "case": 1},
  {"file": "pages/p009-case-01-grid.webp", "w": 900, "h": 1350, "n": 9, "label": "Word search 01: Murder at Gull Rock", "kind": "case-grid", "alt": "The 13 by 13 word search for case 01 'Murder at Gull Rock', with its evidence word list and empty hidden-message boxes.", "case": 1},
  {"file": "pages/p020-case-07-file.webp", "w": 900, "h": 1350, "n": 20, "label": "Case file 07: Cut! Murder on Stage Four", "kind": "case-file", "alt": "Case file 07 'Cut! Murder on Stage Four' (Stage Four, Hollywood, California, 1955): the story, four illustrated suspects A to D and their descriptions.", "case": 7},
  {"file": "pages/p021-case-07-grid.webp", "w": 900, "h": 1350, "n": 21, "label": "Word search 07: Cut! Murder on Stage Four", "kind": "case-grid", "alt": "The 13 by 13 word search for case 07 'Cut! Murder on Stage Four', with its evidence word list and empty hidden-message boxes.", "case": 7},
  {"file": "pages/p096-case-45-file.webp", "w": 900, "h": 1350, "n": 96, "label": "Case file 45: Adrift Above the Atlantic", "kind": "case-file", "alt": "Case file 45 'Adrift Above the Atlantic' (Airship Valkyrie, over the Atlantic, 1930): the story, four illustrated suspects A to D and their descriptions.", "case": 45},
  {"file": "pages/p097-case-45-grid.webp", "w": 900, "h": 1350, "n": 97, "label": "Word search 45: Adrift Above the Atlantic", "kind": "case-grid", "alt": "The 13 by 13 word search for case 45 'Adrift Above the Atlantic', with its evidence word list and empty hidden-message boxes.", "case": 45},
  {"file": "pages/p124-case-59-file.webp", "w": 900, "h": 1350, "n": 124, "label": "Case file 59: The Puppeteer’s Last String", "kind": "case-file", "alt": "Case file 59 'The Puppeteer’s Last String' (Little Lantern Puppet Theater, Prague, 1934): the story, four illustrated suspects A to D and their descriptions.", "case": 59},
  {"file": "pages/p125-case-59-grid.webp", "w": 900, "h": 1350, "n": 125, "label": "Word search 59: The Puppeteer’s Last String", "kind": "case-grid", "alt": "The 13 by 13 word search for case 59 'The Puppeteer’s Last String', with its evidence word list and empty hidden-message boxes.", "case": 59},
  {"file": "pages/p140-case-67-file.webp", "w": 900, "h": 1350, "n": 140, "label": "Case file 67: Dealer’s Last Hand", "kind": "case-file", "alt": "Case file 67 'Dealer’s Last Hand' (Casino du Rocher, Monte Carlo, 1961): the story, four illustrated suspects A to D and their descriptions.", "case": 67},
  {"file": "pages/p141-case-67-grid.webp", "w": 900, "h": 1350, "n": 141, "label": "Word search 67: Dealer’s Last Hand", "kind": "case-grid", "alt": "The 13 by 13 word search for case 67 'Dealer’s Last Hand', with its evidence word list and empty hidden-message boxes.", "case": 67},
  {"file": "pages/p156-case-75-file.webp", "w": 900, "h": 1350, "n": 156, "label": "Case file 75: The Premiere Ends in Silence", "kind": "case-file", "alt": "Case file 75 'The Premiere Ends in Silence' (Film festival, Cannes, 1987): the story, four illustrated suspects A to D and their descriptions.", "case": 75},
  {"file": "pages/p157-case-75-grid.webp", "w": 900, "h": 1350, "n": 157, "label": "Word search 75: The Premiere Ends in Silence", "kind": "case-grid", "alt": "The 13 by 13 word search for case 75 'The Premiere Ends in Silence', with its evidence word list and empty hidden-message boxes.", "case": 75},
]

export interface ArtItem extends ImageRef {
  case: number
  title: string
  setting: string
  year: number
  difficulty: Difficulty
}

/** the 18 line-ups (four suspects A to D each): 1100 x 733 on pure white, to be multiplied over paper */
export const ART: ArtItem[] = [
  {"file": "art/case-01-murder-at-gull-rock.webp", "w": 1100, "h": 733, "case": 1, "title": "Murder at Gull Rock", "setting": "Gull Rock Lighthouse, Cornwall, 1923", "year": 1923, "difficulty": "easy"},
  {"file": "art/case-02-the-last-toast-at-harrow-hall.webp", "w": 1100, "h": 733, "case": 2, "title": "The Last Toast at Harrow Hall", "setting": "Harrow Hall, Yorkshire, 1931", "year": 1931, "difficulty": "easy"},
  {"file": "art/case-03-death-on-the-midnight-express.webp", "w": 1100, "h": 733, "case": 3, "title": "Death on the Midnight Express", "setting": "The Midnight Express, the Alps, 1927", "year": 1927, "difficulty": "easy"},
  {"file": "art/case-06-the-captains-final-dinner.webp", "w": 1100, "h": 733, "case": 6, "title": "The Captain’s Final Dinner", "setting": "Liner Aurelia, North Atlantic, 1912", "year": 1912, "difficulty": "easy"},
  {"file": "art/case-07-cut-murder-on-stage-four.webp", "w": 1100, "h": 733, "case": 7, "title": "Cut! Murder on Stage Four", "setting": "Stage Four, Hollywood, California, 1955", "year": 1955, "difficulty": "easy"},
  {"file": "art/case-11-the-ringmaster-vanishes.webp", "w": 1100, "h": 733, "case": 11, "title": "The Ringmaster Vanishes", "setting": "Merriwell Circus, Dayton, Ohio, 1938", "year": 1938, "difficulty": "easy"},
  {"file": "art/case-16-the-sopranos-last-aria.webp", "w": 1100, "h": 733, "case": 16, "title": "The Soprano’s Last Aria", "setting": "Kaiserhof Opera, Vienna, 1899", "year": 1899, "difficulty": "easy"},
  {"file": "art/case-20-death-before-the-morning-bread.webp", "w": 1100, "h": 733, "case": 20, "title": "Death Before the Morning Bread", "setting": "Moreau Bakery, Paris, 1912", "year": 1912, "difficulty": "easy"},
  {"file": "art/case-26-paddle-wheel-peril.webp", "w": 1100, "h": 733, "case": 26, "title": "Paddle Wheel Peril", "setting": "Steamboat Cotton Duchess, Mississippi River, 1881", "year": 1881, "difficulty": "medium"},
  {"file": "art/case-36-overboard-at-the-regatta.webp", "w": 1100, "h": 733, "case": 36, "title": "Overboard at the Regatta", "setting": "Private yacht, Monaco, 1964", "year": 1964, "difficulty": "medium"},
  {"file": "art/case-45-adrift-above-the-atlantic.webp", "w": 1100, "h": 733, "case": 45, "title": "Adrift Above the Atlantic", "setting": "Airship Valkyrie, over the Atlantic, 1930", "year": 1930, "difficulty": "medium"},
  {"file": "art/case-51-thin-ice.webp", "w": 1100, "h": 733, "case": 51, "title": "Thin Ice", "setting": "Lakeview Ice Arena, Minneapolis, 1976", "year": 1976, "difficulty": "medium"},
  {"file": "art/case-54-steam-salts-and-silence.webp", "w": 1100, "h": 733, "case": 54, "title": "Steam, Salts and Silence", "setting": "Aranyhid Baths, Budapest, 1937", "year": 1937, "difficulty": "medium"},
  {"file": "art/case-59-the-puppeteers-last-string.webp", "w": 1100, "h": 733, "case": 59, "title": "The Puppeteer’s Last String", "setting": "Little Lantern Puppet Theater, Prague, 1934", "year": 1934, "difficulty": "hard"},
  {"file": "art/case-66-the-cattle-barons-last-roundup.webp", "w": 1100, "h": 733, "case": 66, "title": "The Cattle Baron’s Last Roundup", "setting": "Rocking B Ranch, Texas, 1895", "year": 1895, "difficulty": "hard"},
  {"file": "art/case-67-dealers-last-hand.webp", "w": 1100, "h": 733, "case": 67, "title": "Dealer’s Last Hand", "setting": "Casino du Rocher, Monte Carlo, 1961", "year": 1961, "difficulty": "hard"},
  {"file": "art/case-70-the-cruise-that-never-docked.webp", "w": 1100, "h": 733, "case": 70, "title": "The Cruise That Never Docked", "setting": "Cruise ship Coral Majesty, Caribbean Sea, 2004", "year": 2004, "difficulty": "hard"},
  {"file": "art/case-75-the-premiere-ends-in-silence.webp", "w": 1100, "h": 733, "case": 75, "title": "The Premiere Ends in Silence", "setting": "Film festival, Cannes, 1987", "year": 1987, "difficulty": "hard"},
]

export interface SuspectItem extends ImageRef {
  case: number
  letter: 'A' | 'B' | 'C' | 'D'
  title: string
  setting: string
  year: number
}

/** the 16 die-cut suspects (transparent, white rim already included), in manifest order */
export const SUSPECTS: SuspectItem[] = [
  {"file": "stickers/suspect-06C.webp", "w": 381, "h": 726, "case": 6, "letter": "C", "title": "The Captain’s Final Dinner", "setting": "Liner Aurelia, North Atlantic, 1912", "year": 1912},
  {"file": "stickers/suspect-07D.webp", "w": 336, "h": 747, "case": 7, "letter": "D", "title": "Cut! Murder on Stage Four", "setting": "Stage Four, Hollywood, California, 1955", "year": 1955},
  {"file": "stickers/suspect-10A.webp", "w": 447, "h": 771, "case": 10, "letter": "A", "title": "Blue Notes and a Blackout", "setting": "Blue Heron Club, New Orleans, 1934", "year": 1934},
  {"file": "stickers/suspect-13B.webp", "w": 336, "h": 681, "case": 13, "letter": "B", "title": "Sands of the Silent Dig", "setting": "Tell Hamra dig site, Transjordan, 1925", "year": 1925},
  {"file": "stickers/suspect-16A.webp", "w": 480, "h": 963, "case": 16, "letter": "A", "title": "The Soprano’s Last Aria", "setting": "Kaiserhof Opera, Vienna, 1899", "year": 1899},
  {"file": "stickers/suspect-19C.webp", "w": 342, "h": 711, "case": 19, "letter": "C", "title": "Cold Blood at Polar Station Nine", "setting": "Polar Station Nine, Canadian Arctic, 1984", "year": 1984},
  {"file": "stickers/suspect-24D.webp", "w": 312, "h": 876, "case": 24, "letter": "D", "title": "Room 12 Does Not Answer", "setting": "Hotel Kaiserkrone, Berlin, 1928", "year": 1928},
  {"file": "stickers/suspect-28D.webp", "w": 417, "h": 771, "case": 28, "letter": "D", "title": "Silver and Shadows at Dry Gulch", "setting": "Lucky Widow Mine, Dry Gulch, Nevada, 1874", "year": 1874},
  {"file": "stickers/suspect-33B.webp", "w": 252, "h": 768, "case": 33, "letter": "B", "title": "Too Many Cooks", "setting": "Cooking school, Lyon, 1966", "year": 1966},
  {"file": "stickers/suspect-35A.webp", "w": 282, "h": 939, "case": 35, "letter": "A", "title": "The Last Chapter", "setting": "Antiquarian bookshop, Edinburgh, 1938", "year": 1938},
  {"file": "stickers/suspect-36C.webp", "w": 381, "h": 978, "case": 36, "letter": "C", "title": "Overboard at the Regatta", "setting": "Private yacht, Monaco, 1964", "year": 1964},
  {"file": "stickers/suspect-45D.webp", "w": 336, "h": 945, "case": 45, "letter": "D", "title": "Adrift Above the Atlantic", "setting": "Airship Valkyrie, over the Atlantic, 1930", "year": 1930},
  {"file": "stickers/suspect-63A.webp", "w": 345, "h": 963, "case": 63, "letter": "A", "title": "Rally to the Grave", "setting": "Mille Strade rally, Tuscany, Italy, 1957", "year": 1957},
  {"file": "stickers/suspect-70A.webp", "w": 375, "h": 900, "case": 70, "letter": "A", "title": "The Cruise That Never Docked", "setting": "Cruise ship Coral Majesty, Caribbean Sea, 2004", "year": 2004},
  {"file": "stickers/suspect-74D.webp", "w": 330, "h": 780, "case": 74, "letter": "D", "title": "Series A, Murder Z", "setting": "Tech startup office, San Francisco, 2026", "year": 2026},
  {"file": "stickers/suspect-80B.webp", "w": 450, "h": 807, "case": 80, "letter": "B", "title": "Behind the Carnival Mask", "setting": "Mask workshop, Venice, 1893", "year": 1893},
]

export interface MarketingItem extends ImageRef {
  alt: string
}

/** the three step cards (600 x 600) */
export const STEP_CARDS: MarketingItem[] = [
  {"file": "marketing/step-1-read-the-case.webp", "w": 600, "h": 600, "alt": "Step one card: a case file page with a magnifying glass over one suspect, titled Read the Case."},
  {"file": "marketing/step-2-find-the-words.webp", "w": 600, "h": 600, "alt": "Step two card: a word-search grid with words circled, titled Find the Words."},
  {"file": "marketing/step-3-name-the-killer.webp", "w": 600, "h": 600, "alt": "Step three card: a pinned note where crossed-out words leave the letters LEFT-HANDED, titled Name the Killer."},
]

export const BOOK = {"title": "Spelled Guilty", "pages": 214, "cases": 80, "illustratedSuspects": 320, "from": 1874, "to": 2026, "grid": "13 x 13", "trimIn": [6, 9]} as const

/** all 80 cases of the book (title, setting, year, level): nothing about a solution. Used by the scorecard. */
export interface CaseItem {
  n: number
  title: string
  setting: string
  year: number
  difficulty: Difficulty
}

export const CASES: CaseItem[] = [
  {"n": 1, "title": "Murder at Gull Rock", "setting": "Gull Rock Lighthouse, Cornwall, 1923", "year": 1923, "difficulty": "easy"},
  {"n": 2, "title": "The Last Toast at Harrow Hall", "setting": "Harrow Hall, Yorkshire, 1931", "year": 1931, "difficulty": "easy"},
  {"n": 3, "title": "Death on the Midnight Express", "setting": "The Midnight Express, the Alps, 1927", "year": 1927, "difficulty": "easy"},
  {"n": 4, "title": "Curtain Call for Cora", "setting": "Crescent Theater, Broadway, New York, 1948", "year": 1948, "difficulty": "easy"},
  {"n": 5, "title": "Avalanche at Pinewood Lodge", "setting": "Pinewood Lodge, Colorado, 1962", "year": 1962, "difficulty": "easy"},
  {"n": 6, "title": "The Captain’s Final Dinner", "setting": "Liner Aurelia, North Atlantic, 1912", "year": 1912, "difficulty": "easy"},
  {"n": 7, "title": "Cut! Murder on Stage Four", "setting": "Stage Four, Hollywood, California, 1955", "year": 1955, "difficulty": "easy"},
  {"n": 8, "title": "Bitter Grapes at Casa Verde", "setting": "Casa Verde vineyard, Tuscany, 1978", "year": 1978, "difficulty": "easy"},
  {"n": 9, "title": "The Star That Never Rose", "setting": "Cerro Alto Observatory, Chile, 1969", "year": 1969, "difficulty": "easy"},
  {"n": 10, "title": "Blue Notes and a Blackout", "setting": "Blue Heron Club, New Orleans, 1934", "year": 1934, "difficulty": "easy"},
  {"n": 11, "title": "The Ringmaster Vanishes", "setting": "Merriwell Circus, Dayton, Ohio, 1938", "year": 1938, "difficulty": "easy"},
  {"n": 12, "title": "Dust in the Egyptian Wing", "setting": "Ravensworth Museum, London, 1951", "year": 1951, "difficulty": "easy"},
  {"n": 13, "title": "Sands of the Silent Dig", "setting": "Tell Hamra dig site, Transjordan, 1925", "year": 1925, "difficulty": "easy"},
  {"n": 14, "title": "The Orchard Never Forgets", "setting": "Whitcomb Orchard, Vermont, 1946", "year": 1946, "difficulty": "easy"},
  {"n": 15, "title": "Stop the Presses", "setting": "Chicago Evening Ledger, Chicago, 1949", "year": 1949, "difficulty": "easy"},
  {"n": 16, "title": "The Soprano’s Last Aria", "setting": "Kaiserhof Opera, Vienna, 1899", "year": 1899, "difficulty": "easy"},
  {"n": 17, "title": "Trouble at the Dusty Rodeo", "setting": "Dusty Rodeo, Cody, Wyoming, 1957", "year": 1957, "difficulty": "easy"},
  {"n": 18, "title": "The Scribe’s Secret", "setting": "Hohenfels Abbey library, Austria, 1888", "year": 1888, "difficulty": "easy"},
  {"n": 19, "title": "Cold Blood at Polar Station Nine", "setting": "Polar Station Nine, Canadian Arctic, 1984", "year": 1984, "difficulty": "easy"},
  {"n": 20, "title": "Death Before the Morning Bread", "setting": "Moreau Bakery, Paris, 1912", "year": 1912, "difficulty": "easy"},
  {"n": 21, "title": "The Formula Dies at Midnight", "setting": "Ashworth Hall Laboratory, Boston, 1957", "year": 1957, "difficulty": "easy"},
  {"n": 22, "title": "Orchids and Foxglove", "setting": "Royal Botanic Gardens, Kew, 1904", "year": 1904, "difficulty": "easy"},
  {"n": 23, "title": "Fixed at the Finish Line", "setting": "Bluegrass Downs, Lexington, Kentucky, 1951", "year": 1951, "difficulty": "easy"},
  {"n": 24, "title": "Room 12 Does Not Answer", "setting": "Hotel Kaiserkrone, Berlin, 1928", "year": 1928, "difficulty": "easy"},
  {"n": 25, "title": "Sale Ends in Murder", "setting": "Ashgrove’s Department Store, London, 1936", "year": 1936, "difficulty": "easy"},
  {"n": 26, "title": "Paddle Wheel Peril", "setting": "Steamboat Cotton Duchess, Mississippi River, 1881", "year": 1881, "difficulty": "medium"},
  {"n": 27, "title": "The Clock Struck Thirteen", "setting": "Old Town Clock Tower, Prague, 1901", "year": 1901, "difficulty": "medium"},
  {"n": 28, "title": "Silver and Shadows at Dry Gulch", "setting": "Lucky Widow Mine, Dry Gulch, Nevada, 1874", "year": 1874, "difficulty": "medium"},
  {"n": 29, "title": "A Stitch in Crime", "setting": "Maison Roux, Paris, 1957", "year": 1957, "difficulty": "medium"},
  {"n": 30, "title": "The Keeper Who Never Fed the Lions", "setting": "Lindenhof Zoo, Berlin, 1932", "year": 1932, "difficulty": "medium"},
  {"n": 31, "title": "Dead Air at WKRL", "setting": "WKRL radio station, Detroit, 1958", "year": 1958, "difficulty": "medium"},
  {"n": 32, "title": "Going Once, Going Twice, Gone", "setting": "Auction house, Geneva, 1973", "year": 1973, "difficulty": "medium"},
  {"n": 33, "title": "Too Many Cooks", "setting": "Cooking school, Lyon, 1966", "year": 1966, "difficulty": "medium"},
  {"n": 34, "title": "The Blue Ribbon Murder", "setting": "Cedar County Fair, Iowa, 1952", "year": 1952, "difficulty": "medium"},
  {"n": 35, "title": "The Last Chapter", "setting": "Antiquarian bookshop, Edinburgh, 1938", "year": 1938, "difficulty": "medium"},
  {"n": 36, "title": "Overboard at the Regatta", "setting": "Private yacht, Monaco, 1964", "year": 1964, "difficulty": "medium"},
  {"n": 37, "title": "The Portcullis Falls at Dawn", "setting": "Highland castle, Scotland, 1889", "year": 1889, "difficulty": "medium"},
  {"n": 38, "title": "Checkmate in Three Moves", "setting": "Chess club, Budapest, 1959", "year": 1959, "difficulty": "medium"},
  {"n": 39, "title": "Balloon Down", "setting": "Balloon festival, Albuquerque, New Mexico, 1992", "year": 1992, "difficulty": "medium"},
  {"n": 40, "title": "Leaves of Poison", "setting": "Tea plantation, Ceylon, 1912", "year": 1912, "difficulty": "medium"},
  {"n": 41, "title": "A Bottle of Betrayal", "setting": "Ardan Parfums, Grasse, France, 1925", "year": 1925, "difficulty": "medium"},
  {"n": 42, "title": "High Noon at the Gold Dust Saloon", "setting": "Gold Dust Saloon, Cinder Flats, Arizona Territory, 1883", "year": 1883, "difficulty": "medium"},
  {"n": 43, "title": "The Thesis Nobody Finished", "setting": "University library, Oxford, England, 1976", "year": 1976, "difficulty": "medium"},
  {"n": 44, "title": "The Quiet Ward", "setting": "Edelweiss Sanatorium, Davos, Switzerland, 1921", "year": 1921, "difficulty": "medium"},
  {"n": 45, "title": "Adrift Above the Atlantic", "setting": "Airship Valkyrie, over the Atlantic, 1930", "year": 1930, "difficulty": "medium"},
  {"n": 46, "title": "The Cable Car Stops Halfway", "setting": "Piz Arlas cable car, Swiss Alps, 1957", "year": 1957, "difficulty": "medium"},
  {"n": 47, "title": "Foam and Fury", "setting": "Lindwurm Brewery, Munich, Germany, 1905", "year": 1905, "difficulty": "medium"},
  {"n": 48, "title": "The Vault Was Never Empty", "setting": "Lakeshore Savings Bank, Chicago, 1932", "year": 1932, "difficulty": "medium"},
  {"n": 49, "title": "Tick, Tock, Dead", "setting": "Watchmaker’s workshop, Geneva, Switzerland, 1887", "year": 1887, "difficulty": "medium"},
  {"n": 50, "title": "Mulled Wine and Murder", "setting": "Christmas market, Vienna, Austria, 1993", "year": 1993, "difficulty": "medium"},
  {"n": 51, "title": "Thin Ice", "setting": "Lakeview Ice Arena, Minneapolis, 1976", "year": 1976, "difficulty": "medium"},
  {"n": 52, "title": "A Hole in One, A Body in the Bunker", "setting": "Eden Burn Golf Club, St Andrews, 1962", "year": 1962, "difficulty": "medium"},
  {"n": 53, "title": "The Mainsail Mystery", "setting": "Sailing regatta, Newport, Rhode Island, 1958", "year": 1958, "difficulty": "medium"},
  {"n": 54, "title": "Steam, Salts and Silence", "setting": "Aranyhid Baths, Budapest, 1937", "year": 1937, "difficulty": "medium"},
  {"n": 55, "title": "Salt on the Cannery Wall", "setting": "Pacific Star Cannery, Monterey, California, 1948", "year": 1948, "difficulty": "medium"},
  {"n": 56, "title": "The Ambassador’s Last Cable", "setting": "British Embassy, Cairo, 1956", "year": 1956, "difficulty": "hard"},
  {"n": 57, "title": "Refuge Number Seven", "setting": "Refuge Number Seven, Dolomites, Italy, 1971", "year": 1971, "difficulty": "hard"},
  {"n": 58, "title": "Stamped for Murder", "setting": "Collectors’ convention, Zurich, 1967", "year": 1967, "difficulty": "hard"},
  {"n": 59, "title": "The Puppeteer’s Last String", "setting": "Little Lantern Puppet Theater, Prague, 1934", "year": 1934, "difficulty": "hard"},
  {"n": 60, "title": "Clay Hands, Cold Heart", "setting": "Pottery studio, Kyoto, Japan, 1989", "year": 1989, "difficulty": "hard"},
  {"n": 61, "title": "Scaffolds in the Nave", "setting": "Chartres Cathedral, France, 1924", "year": 1924, "difficulty": "hard"},
  {"n": 62, "title": "The Storm Station Goes Silent", "setting": "Hekla Point weather station, Iceland, 1953", "year": 1953, "difficulty": "hard"},
  {"n": 63, "title": "Rally to the Grave", "setting": "Mille Strade rally, Tuscany, Italy, 1957", "year": 1957, "difficulty": "hard"},
  {"n": 64, "title": "Brushstrokes of Guilt", "setting": "Dubois art school, Paris, 1900", "year": 1900, "difficulty": "hard"},
  {"n": 65, "title": "Smoke on the Peat", "setting": "Port Ailsa Distillery, Islay, Scotland, 1938", "year": 1938, "difficulty": "hard"},
  {"n": 66, "title": "The Cattle Baron’s Last Roundup", "setting": "Rocking B Ranch, Texas, 1895", "year": 1895, "difficulty": "hard"},
  {"n": 67, "title": "Dealer’s Last Hand", "setting": "Casino du Rocher, Monte Carlo, 1961", "year": 1961, "difficulty": "hard"},
  {"n": 68, "title": "Lost in the Files", "setting": "Keizer City Archive, Amsterdam, 1946", "year": 1946, "difficulty": "hard"},
  {"n": 69, "title": "A Rose by Any Other Poison", "setting": "Chelsea Flower Show, London, 1968", "year": 1968, "difficulty": "hard"},
  {"n": 70, "title": "The Cruise That Never Docked", "setting": "Cruise ship Coral Majesty, Caribbean Sea, 2004", "year": 2004, "difficulty": "hard"},
  {"n": 71, "title": "The Verdict Was Poisoned", "setting": "Courthouse, Boston, 1952", "year": 1952, "difficulty": "hard"},
  {"n": 72, "title": "The Members Only Murder", "setting": "Private gentlemen’s club, London, 1895", "year": 1895, "difficulty": "hard"},
  {"n": 73, "title": "Discord at the Conservatory", "setting": "Music conservatory, Vienna, 1912", "year": 1912, "difficulty": "hard"},
  {"n": 74, "title": "Series A, Murder Z", "setting": "Tech startup office, San Francisco, 2026", "year": 2026, "difficulty": "hard"},
  {"n": 75, "title": "The Premiere Ends in Silence", "setting": "Film festival, Cannes, 1987", "year": 1987, "difficulty": "hard"},
  {"n": 76, "title": "The Forgery on Gallery Wall Nine", "setting": "Gallery opening, Florence, 1999", "year": 1999, "difficulty": "hard"},
  {"n": 77, "title": "Last Ferry to Nowhere", "setting": "Car ferry, Washington State, 1974", "year": 1974, "difficulty": "hard"},
  {"n": 78, "title": "Lost in the Hedge Maze", "setting": "Estate hedge maze, Devon, 1921", "year": 1921, "difficulty": "hard"},
  {"n": 79, "title": "The Ice Hotel Melts at Midnight", "setting": "Ice hotel, Lapland, 2016", "year": 2016, "difficulty": "hard"},
  {"n": 80, "title": "Behind the Carnival Mask", "setting": "Mask workshop, Venice, 1893", "year": 1893, "difficulty": "hard"},
]
