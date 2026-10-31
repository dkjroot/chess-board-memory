"use strict";

// Curated teaching order; level labels are guidance, not rating requirements.
// Names/move-order references: lichess-org/chess-openings (CC0).
const REPERTOIRE = {
  "levels": [
    {
      "id": "beginner",
      "name": "Beginner",
      "description": "Natural development, central pawns and getting the king safe."
    },
    {
      "id": "early-intermediate",
      "name": "Early intermediate",
      "description": "Add open-centre tactics and clear pawn-chain plans."
    },
    {
      "id": "intermediate",
      "name": "Intermediate",
      "description": "Explore longer-term pressure, pawn breaks and different central structures."
    },
    {
      "id": "late-intermediate",
      "name": "Late intermediate",
      "description": "Add flexible move orders, fianchetto systems and piece-versus-pawn decisions."
    },
    {
      "id": "advanced",
      "name": "Advanced",
      "description": "Study dynamic imbalances and sharper, more concrete branches."
    },
    {
      "id": "expert",
      "name": "Expert",
      "description": "The full catalogue, including demanding theoretical defences."
    }
  ],
  "openings": [
    {
      "id": "italian-white",
      "name": "Italian Game",
      "side": "white",
      "level": 0,
      "lines": [
        {
          "id": "italian-white-giuoco-piano",
          "name": "Giuoco Piano",
          "eco": "C50",
          "reference": "Italian Game: Giuoco Pianissimo, Canal Variation",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "e7",
              "e5",
              "e5"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ],
            [
              "f1",
              "c4",
              "Bc4",
              "Develop the bishop towards f7 and clear the way for kingside castling."
            ],
            [
              "f8",
              "c5",
              "Bc5"
            ],
            [
              "d2",
              "d3",
              "d3"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "e1",
              "g1",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "d7",
              "d6",
              "d6"
            ]
          ]
        },
        {
          "id": "italian-white-two-knights",
          "name": "Two Knights",
          "eco": "C50",
          "reference": "Italian Game: Giuoco Pianissimo, Normal",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "e7",
              "e5",
              "e5"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ],
            [
              "f1",
              "c4",
              "Bc4",
              "Develop the bishop towards f7 and clear the way for kingside castling."
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "d2",
              "d3",
              "d3"
            ],
            [
              "f8",
              "c5",
              "Bc5"
            ],
            [
              "e1",
              "g1",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "d7",
              "d6",
              "d6"
            ]
          ]
        }
      ]
    },
    {
      "id": "italian-black",
      "name": "Against the Italian",
      "side": "black",
      "level": 0,
      "lines": [
        {
          "id": "italian-black-quiet",
          "name": "Quiet d3 setup",
          "eco": "C50",
          "reference": "Italian Game: Giuoco Pianissimo, Canal Variation",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "e7",
              "e5",
              "e5"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ],
            [
              "f1",
              "c4",
              "Bc4"
            ],
            [
              "f8",
              "c5",
              "Bc5",
              "Develop the bishop actively while contesting the centre and preparing to castle."
            ],
            [
              "d2",
              "d3",
              "d3"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "e1",
              "g1",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "d7",
              "d6",
              "d6"
            ]
          ]
        },
        {
          "id": "italian-black-central",
          "name": "Central c3 setup",
          "eco": "C54",
          "reference": "Italian Game: Classical Variation, Greco Gambit, Greco Variation",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "e7",
              "e5",
              "e5"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ],
            [
              "f1",
              "c4",
              "Bc4"
            ],
            [
              "f8",
              "c5",
              "Bc5",
              "Develop the bishop actively while contesting the centre and preparing to castle."
            ],
            [
              "c2",
              "c3",
              "c3"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "e5",
              "d4",
              "exd4"
            ],
            [
              "c3",
              "d4",
              "cxd4"
            ],
            [
              "c5",
              "b4",
              "Bb4+"
            ]
          ]
        }
      ]
    },
    {
      "id": "scandinavian-black",
      "name": "Scandinavian Defence",
      "side": "black",
      "level": 0,
      "lines": [
        {
          "id": "scandinavian-black-qa5",
          "name": "Queen to a5",
          "eco": "B01",
          "reference": "Scandinavian Defense: Classical Variation",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "d7",
              "d5",
              "d5",
              "Challenge the e4 pawn immediately. The queen recapture will cost time if White develops with an attack on it."
            ],
            [
              "e4",
              "d5",
              "exd5"
            ],
            [
              "d8",
              "d5",
              "Qxd5"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "d5",
              "a5",
              "Qa5"
            ],
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "c7",
              "c6",
              "c6"
            ]
          ]
        },
        {
          "id": "scandinavian-black-qd6",
          "name": "Queen to d6",
          "eco": "B01",
          "reference": "Scandinavian Defense: Bronstein Variation",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "d7",
              "d5",
              "d5",
              "Challenge the e4 pawn immediately. The queen recapture will cost time if White develops with an attack on it."
            ],
            [
              "e4",
              "d5",
              "exd5"
            ],
            [
              "d8",
              "d5",
              "Qxd5"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "d5",
              "d6",
              "Qd6"
            ],
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "a7",
              "a6",
              "a6"
            ]
          ]
        }
      ]
    },
    {
      "id": "caro-kann-black",
      "name": "Caro-Kann Defence",
      "side": "black",
      "level": 0,
      "lines": [
        {
          "id": "caro-kann-black-advance",
          "name": "Advance",
          "eco": "B12",
          "reference": "Caro-Kann Defense: Advance Variation, Short Variation",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "c7",
              "c6",
              "c6",
              "Prepare ...d5 with a pawn, challenging the centre while keeping the c8 bishop’s diagonal available."
            ],
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "d7",
              "d5",
              "d5"
            ],
            [
              "e4",
              "e5",
              "e5"
            ],
            [
              "c8",
              "f5",
              "Bf5"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "e7",
              "e6",
              "e6"
            ],
            [
              "f1",
              "e2",
              "Be2"
            ],
            [
              "c6",
              "c5",
              "c5"
            ]
          ]
        },
        {
          "id": "caro-kann-black-classical",
          "name": "Classical",
          "eco": "B15",
          "reference": "Caro-Kann Defense: Alekhine Gambit",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "c7",
              "c6",
              "c6",
              "Prepare ...d5 with a pawn, challenging the centre while keeping the c8 bishop’s diagonal available."
            ],
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "d7",
              "d5",
              "d5"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "d5",
              "e4",
              "dxe4"
            ],
            [
              "c3",
              "e4",
              "Nxe4"
            ],
            [
              "c8",
              "f5",
              "Bf5"
            ],
            [
              "e4",
              "g3",
              "Ng3"
            ],
            [
              "f5",
              "g6",
              "Bg6"
            ]
          ]
        }
      ]
    },
    {
      "id": "scotch-white",
      "name": "Scotch Game",
      "side": "white",
      "level": 1,
      "lines": [
        {
          "id": "scotch-white-classical",
          "name": "Classical",
          "eco": "C45",
          "reference": "Scotch Game: Classical Variation, Blackburne Attack",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "e7",
              "e5",
              "e5"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ],
            [
              "d2",
              "d4",
              "d4",
              "Open the centre early, giving your pieces more space and bringing tactics into play."
            ],
            [
              "e5",
              "d4",
              "exd4"
            ],
            [
              "f3",
              "d4",
              "Nxd4"
            ],
            [
              "f8",
              "c5",
              "Bc5"
            ],
            [
              "c1",
              "e3",
              "Be3"
            ],
            [
              "d8",
              "f6",
              "Qf6"
            ],
            [
              "c2",
              "c3",
              "c3"
            ],
            [
              "g8",
              "e7",
              "Nge7"
            ]
          ]
        },
        {
          "id": "scotch-white-schmidt",
          "name": "Schmidt",
          "eco": "C45",
          "reference": "Scotch Game: Alekhine Gambit",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "e7",
              "e5",
              "e5"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ],
            [
              "d2",
              "d4",
              "d4",
              "Open the centre early, giving your pieces more space and bringing tactics into play."
            ],
            [
              "e5",
              "d4",
              "exd4"
            ],
            [
              "f3",
              "d4",
              "Nxd4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "f8",
              "b4",
              "Bb4"
            ],
            [
              "d4",
              "c6",
              "Nxc6"
            ],
            [
              "b7",
              "c6",
              "bxc6"
            ]
          ]
        }
      ]
    },
    {
      "id": "scotch-black",
      "name": "Against the Scotch",
      "side": "black",
      "level": 1,
      "lines": [
        {
          "id": "scotch-black-classical",
          "name": "Classical ...Bc5",
          "eco": "C45",
          "reference": "Scotch Game: Classical Variation, Blackburne Attack",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "e7",
              "e5",
              "e5"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ],
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "e5",
              "d4",
              "exd4"
            ],
            [
              "f3",
              "d4",
              "Nxd4"
            ],
            [
              "f8",
              "c5",
              "Bc5",
              "Develop the bishop actively rather than spending another move protecting the centre with a pawn."
            ],
            [
              "c1",
              "e3",
              "Be3"
            ],
            [
              "d8",
              "f6",
              "Qf6"
            ],
            [
              "c2",
              "c3",
              "c3"
            ],
            [
              "g8",
              "e7",
              "Nge7"
            ]
          ]
        }
      ]
    },
    {
      "id": "vienna-white",
      "name": "Vienna Game",
      "side": "white",
      "level": 1,
      "lines": [
        {
          "id": "vienna-white-falkbeer",
          "name": "Falkbeer Defence",
          "eco": "C26",
          "reference": "Vienna Game: Stanley Variation",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "e7",
              "e5",
              "e5"
            ],
            [
              "b1",
              "c3",
              "Nc3",
              "Develop the queenside knight before deciding how to support or expand your centre."
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "f1",
              "c4",
              "Bc4"
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ],
            [
              "d2",
              "d3",
              "d3"
            ],
            [
              "f8",
              "c5",
              "Bc5"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "d7",
              "d6",
              "d6"
            ]
          ]
        },
        {
          "id": "vienna-white-max-lange",
          "name": "Max Lange Defence",
          "eco": "C25",
          "reference": "Vienna Game: Stanley Variation, Meitner-Mieses Gambit",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "e7",
              "e5",
              "e5"
            ],
            [
              "b1",
              "c3",
              "Nc3",
              "Develop the queenside knight before deciding how to support or expand your centre."
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ],
            [
              "f1",
              "c4",
              "Bc4"
            ],
            [
              "f8",
              "c5",
              "Bc5"
            ],
            [
              "d2",
              "d3",
              "d3"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "d7",
              "d6",
              "d6"
            ]
          ]
        }
      ]
    },
    {
      "id": "french-black",
      "name": "French Defence",
      "side": "black",
      "level": 1,
      "lines": [
        {
          "id": "french-black-advance",
          "name": "Advance",
          "eco": "C02",
          "reference": "French Defense: Advance Variation, Lputian Variation",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "e7",
              "e6",
              "e6"
            ],
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "d7",
              "d5",
              "d5",
              "Challenge White’s e4 pawn with ...d5. Pawn chains will make the right pawn breaks important."
            ],
            [
              "e4",
              "e5",
              "e5"
            ],
            [
              "c7",
              "c5",
              "c5"
            ],
            [
              "c2",
              "c3",
              "c3"
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "d8",
              "b6",
              "Qb6"
            ]
          ]
        },
        {
          "id": "french-black-exchange",
          "name": "Exchange",
          "eco": "C01",
          "reference": "French Defense: Exchange Variation",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "e7",
              "e6",
              "e6"
            ],
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "d7",
              "d5",
              "d5",
              "Challenge White’s e4 pawn with ...d5. Pawn chains will make the right pawn breaks important."
            ],
            [
              "e4",
              "d5",
              "exd5"
            ],
            [
              "e6",
              "d5",
              "exd5"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "f1",
              "d3",
              "Bd3"
            ],
            [
              "f8",
              "d6",
              "Bd6"
            ]
          ]
        }
      ]
    },
    {
      "id": "ruy-lopez-white",
      "name": "Ruy Lopez",
      "side": "white",
      "level": 2,
      "lines": [
        {
          "id": "ruy-lopez-white-morphy",
          "name": "Morphy Defence",
          "eco": "C88",
          "reference": "Ruy Lopez: Closed, Alekhine Gambit",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "e7",
              "e5",
              "e5"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ],
            [
              "f1",
              "b5",
              "Bb5",
              "Attack the knight that defends e5, increasing the pressure on Black’s central pawn."
            ],
            [
              "a7",
              "a6",
              "a6"
            ],
            [
              "b5",
              "a4",
              "Ba4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "e1",
              "g1",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "f8",
              "e7",
              "Be7"
            ],
            [
              "f1",
              "e1",
              "Re1"
            ],
            [
              "b7",
              "b5",
              "b5"
            ],
            [
              "a4",
              "b3",
              "Bb3"
            ],
            [
              "d7",
              "d6",
              "d6"
            ]
          ]
        },
        {
          "id": "ruy-lopez-white-berlin",
          "name": "Berlin Defence",
          "eco": "C67",
          "reference": "Ruy Lopez: Berlin Defense, Berlin Wall",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "e7",
              "e5",
              "e5"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ],
            [
              "f1",
              "b5",
              "Bb5",
              "Attack the knight that defends e5, increasing the pressure on Black’s central pawn."
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "e1",
              "g1",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "f6",
              "e4",
              "Nxe4"
            ],
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "e4",
              "d6",
              "Nd6"
            ],
            [
              "b5",
              "c6",
              "Bxc6"
            ],
            [
              "d7",
              "c6",
              "dxc6"
            ],
            [
              "d4",
              "e5",
              "dxe5"
            ],
            [
              "d6",
              "f5",
              "Nf5"
            ]
          ]
        }
      ]
    },
    {
      "id": "ruy-lopez-black",
      "name": "Against the Ruy Lopez",
      "side": "black",
      "level": 2,
      "lines": [
        {
          "id": "ruy-lopez-black-closed",
          "name": "Closed setup",
          "eco": "C88",
          "reference": "Ruy Lopez: Closed, Alekhine Gambit",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "e7",
              "e5",
              "e5"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ],
            [
              "f1",
              "b5",
              "Bb5"
            ],
            [
              "a7",
              "a6",
              "a6",
              "Ask the bishop to decide where it belongs before continuing your development."
            ],
            [
              "b5",
              "a4",
              "Ba4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "e1",
              "g1",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "f8",
              "e7",
              "Be7"
            ],
            [
              "f1",
              "e1",
              "Re1"
            ],
            [
              "b7",
              "b5",
              "b5"
            ],
            [
              "a4",
              "b3",
              "Bb3"
            ],
            [
              "d7",
              "d6",
              "d6"
            ]
          ]
        },
        {
          "id": "ruy-lopez-black-exchange",
          "name": "Exchange",
          "eco": "C69",
          "reference": "Ruy Lopez: Exchange Variation, Gligoric Variation",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "e7",
              "e5",
              "e5"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ],
            [
              "f1",
              "b5",
              "Bb5"
            ],
            [
              "a7",
              "a6",
              "a6",
              "Ask the bishop to decide where it belongs before continuing your development."
            ],
            [
              "b5",
              "c6",
              "Bxc6"
            ],
            [
              "d7",
              "c6",
              "dxc6"
            ],
            [
              "e1",
              "g1",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "f7",
              "f6",
              "f6"
            ]
          ]
        }
      ]
    },
    {
      "id": "slav-black",
      "name": "Slav Defence",
      "side": "black",
      "level": 2,
      "lines": [
        {
          "id": "slav-black-main",
          "name": "Main line",
          "eco": "D17",
          "reference": "Slav Defense: Czech Variation",
          "moves": [
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "d7",
              "d5",
              "d5"
            ],
            [
              "c2",
              "c4",
              "c4"
            ],
            [
              "c7",
              "c6",
              "c6",
              "Support d5 with the c-pawn while leaving the c8 bishop free to develop."
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "d5",
              "c4",
              "dxc4"
            ],
            [
              "a2",
              "a4",
              "a4"
            ],
            [
              "c8",
              "f5",
              "Bf5"
            ]
          ]
        },
        {
          "id": "slav-black-exchange",
          "name": "Exchange",
          "eco": "D14",
          "reference": "Slav Defense: Exchange Variation, Symmetrical Line",
          "moves": [
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "d7",
              "d5",
              "d5"
            ],
            [
              "c2",
              "c4",
              "c4"
            ],
            [
              "c7",
              "c6",
              "c6",
              "Support d5 with the c-pawn while leaving the c8 bishop free to develop."
            ],
            [
              "c4",
              "d5",
              "cxd5"
            ],
            [
              "c6",
              "d5",
              "cxd5"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ]
          ]
        }
      ]
    },
    {
      "id": "alapin-white",
      "name": "Alapin Sicilian",
      "side": "white",
      "level": 2,
      "lines": [
        {
          "id": "alapin-white-d5",
          "name": "Against ...d5",
          "eco": "B22",
          "reference": "Sicilian Defense: Alapin Variation, Barmen Defense, Central Exchange",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "c7",
              "c5",
              "c5"
            ],
            [
              "c2",
              "c3",
              "c3",
              "Prepare d4 with the c-pawn, aiming for a broad pawn centre instead of an Open Sicilian."
            ],
            [
              "d7",
              "d5",
              "d5"
            ],
            [
              "e4",
              "d5",
              "exd5"
            ],
            [
              "d8",
              "d5",
              "Qxd5"
            ],
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "c5",
              "d4",
              "cxd4"
            ],
            [
              "c3",
              "d4",
              "cxd4"
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "c8",
              "g4",
              "Bg4"
            ]
          ]
        },
        {
          "id": "alapin-white-nf6",
          "name": "Against ...Nf6",
          "eco": "B22",
          "reference": "Sicilian Defense: Alapin Variation, Smith-Morra Declined",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "c7",
              "c5",
              "c5"
            ],
            [
              "c2",
              "c3",
              "c3",
              "Prepare d4 with the c-pawn, aiming for a broad pawn centre instead of an Open Sicilian."
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "e4",
              "e5",
              "e5"
            ],
            [
              "f6",
              "d5",
              "Nd5"
            ],
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "c5",
              "d4",
              "cxd4"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ],
            [
              "c3",
              "d4",
              "cxd4"
            ],
            [
              "d7",
              "d6",
              "d6"
            ]
          ]
        }
      ]
    },
    {
      "id": "english-white",
      "name": "English Opening",
      "side": "white",
      "level": 2,
      "lines": [
        {
          "id": "english-white-reversed-sicilian",
          "name": "Against ...e5",
          "eco": "A22",
          "reference": "English Opening: King's English Variation, Two Knights Variation, Reversed Dragon",
          "moves": [
            [
              "c2",
              "c4",
              "c4",
              "Control d5 from the flank and keep your central pawn structure flexible."
            ],
            [
              "e7",
              "e5",
              "e5"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "g2",
              "g3",
              "g3"
            ],
            [
              "d7",
              "d5",
              "d5"
            ],
            [
              "c4",
              "d5",
              "cxd5"
            ],
            [
              "f6",
              "d5",
              "Nxd5"
            ],
            [
              "f1",
              "g2",
              "Bg2"
            ],
            [
              "d5",
              "b6",
              "Nb6"
            ]
          ]
        },
        {
          "id": "english-white-symmetrical",
          "name": "Symmetrical",
          "eco": "A38",
          "reference": "English Opening: Symmetrical Variation, Double Fianchetto",
          "moves": [
            [
              "c2",
              "c4",
              "c4",
              "Control d5 from the flank and keep your central pawn structure flexible."
            ],
            [
              "c7",
              "c5",
              "c5"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ],
            [
              "g2",
              "g3",
              "g3"
            ],
            [
              "g7",
              "g6",
              "g6"
            ],
            [
              "f1",
              "g2",
              "Bg2"
            ],
            [
              "f8",
              "g7",
              "Bg7"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ]
          ]
        }
      ]
    },
    {
      "id": "nimzo-indian-black",
      "name": "Nimzo-Indian Defence",
      "side": "black",
      "level": 3,
      "lines": [
        {
          "id": "nimzo-indian-black-rubinstein",
          "name": "Rubinstein e3",
          "eco": "E53",
          "reference": "Nimzo-Indian Defense: Normal Variation, Gligoric System",
          "moves": [
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "c2",
              "c4",
              "c4"
            ],
            [
              "e7",
              "e6",
              "e6"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "f8",
              "b4",
              "Bb4",
              "Pin the c3 knight, restraining e4 and creating the option to damage White’s queenside pawns."
            ],
            [
              "e2",
              "e3",
              "e3"
            ],
            [
              "e8",
              "g8",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "f1",
              "d3",
              "Bd3"
            ],
            [
              "d7",
              "d5",
              "d5"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "c7",
              "c5",
              "c5"
            ]
          ]
        },
        {
          "id": "nimzo-indian-black-classical",
          "name": "Classical Qc2",
          "eco": "E32",
          "reference": "Nimzo-Indian Defense: Classical Variation, Keres Defense",
          "moves": [
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "c2",
              "c4",
              "c4"
            ],
            [
              "e7",
              "e6",
              "e6"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "f8",
              "b4",
              "Bb4",
              "Pin the c3 knight, restraining e4 and creating the option to damage White’s queenside pawns."
            ],
            [
              "d1",
              "c2",
              "Qc2"
            ],
            [
              "e8",
              "g8",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "a2",
              "a3",
              "a3"
            ],
            [
              "b4",
              "c3",
              "Bxc3+"
            ],
            [
              "c2",
              "c3",
              "Qxc3"
            ],
            [
              "b7",
              "b6",
              "b6"
            ]
          ]
        }
      ]
    },
    {
      "id": "queens-indian-black",
      "name": "Queen’s Indian Defence",
      "side": "black",
      "level": 3,
      "lines": [
        {
          "id": "queens-indian-black-fianchetto",
          "name": "Fianchetto",
          "eco": "E17",
          "reference": "Queen's Indian Defense: Classical Variation, Polugaevsky Gambit",
          "moves": [
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "c2",
              "c4",
              "c4"
            ],
            [
              "e7",
              "e6",
              "e6"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "b7",
              "b6",
              "b6",
              "Prepare to fianchetto the bishop on b7, controlling the long diagonal and the e4 square."
            ],
            [
              "g2",
              "g3",
              "g3"
            ],
            [
              "c8",
              "b7",
              "Bb7"
            ],
            [
              "f1",
              "g2",
              "Bg2"
            ],
            [
              "f8",
              "e7",
              "Be7"
            ],
            [
              "e1",
              "g1",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "e8",
              "g8",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ]
          ]
        },
        {
          "id": "queens-indian-black-petrosian",
          "name": "Petrosian a3",
          "eco": "E12",
          "reference": "Queen's Indian Defense: Kasparov-Petrosian Variation, Classical Variation",
          "moves": [
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "c2",
              "c4",
              "c4"
            ],
            [
              "e7",
              "e6",
              "e6"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "b7",
              "b6",
              "b6",
              "Prepare to fianchetto the bishop on b7, controlling the long diagonal and the e4 square."
            ],
            [
              "a2",
              "a3",
              "a3"
            ],
            [
              "c8",
              "b7",
              "Bb7"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "d7",
              "d5",
              "d5"
            ],
            [
              "c4",
              "d5",
              "cxd5"
            ],
            [
              "e6",
              "d5",
              "exd5"
            ]
          ]
        }
      ]
    },
    {
      "id": "pirc-black",
      "name": "Pirc Defence",
      "side": "black",
      "level": 3,
      "lines": [
        {
          "id": "pirc-black-classical",
          "name": "Classical",
          "eco": "B08",
          "reference": "Pirc Defense: Classical Variation, Quiet System, Czech Defense",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "d7",
              "d6",
              "d6"
            ],
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "g7",
              "g6",
              "g6",
              "Prepare a kingside fianchetto, allowing White central space that you will later challenge."
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "f8",
              "g7",
              "Bg7"
            ],
            [
              "f1",
              "e2",
              "Be2"
            ],
            [
              "e8",
              "g8",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "e1",
              "g1",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "c7",
              "c6",
              "c6"
            ]
          ]
        },
        {
          "id": "pirc-black-austrian",
          "name": "Austrian Attack",
          "eco": "B09",
          "reference": "Pirc Defense: Austrian Attack",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "d7",
              "d6",
              "d6"
            ],
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "g7",
              "g6",
              "g6",
              "Prepare a kingside fianchetto, allowing White central space that you will later challenge."
            ],
            [
              "f2",
              "f4",
              "f4"
            ],
            [
              "f8",
              "g7",
              "Bg7"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "e8",
              "g8",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ]
          ]
        }
      ]
    },
    {
      "id": "reti-white",
      "name": "Réti Opening",
      "side": "white",
      "level": 3,
      "lines": [
        {
          "id": "reti-white-accepted",
          "name": "Accepted",
          "eco": "A09",
          "reference": "Réti Opening: Réti Gambit, Keres Variation",
          "moves": [
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "d7",
              "d5",
              "d5"
            ],
            [
              "c2",
              "c4",
              "c4",
              "Challenge Black’s central pawn from the flank while keeping your own centre flexible."
            ],
            [
              "d5",
              "c4",
              "dxc4"
            ],
            [
              "e2",
              "e3",
              "e3"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "f1",
              "c4",
              "Bxc4"
            ],
            [
              "e7",
              "e6",
              "e6"
            ],
            [
              "e1",
              "g1",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "c7",
              "c5",
              "c5"
            ]
          ]
        },
        {
          "id": "reti-white-advance",
          "name": "Advance",
          "eco": "A09",
          "reference": "Réti Opening: Reversed Blumenfeld Gambit",
          "moves": [
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "d7",
              "d5",
              "d5"
            ],
            [
              "c2",
              "c4",
              "c4",
              "Challenge Black’s central pawn from the flank while keeping your own centre flexible."
            ],
            [
              "d5",
              "d4",
              "d4"
            ],
            [
              "e2",
              "e3",
              "e3"
            ],
            [
              "c7",
              "c5",
              "c5"
            ],
            [
              "e3",
              "d4",
              "exd4"
            ],
            [
              "c5",
              "d4",
              "cxd4"
            ],
            [
              "d2",
              "d3",
              "d3"
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ]
          ]
        }
      ]
    },
    {
      "id": "kings-indian-black",
      "name": "King’s Indian Defence",
      "side": "black",
      "level": 4,
      "lines": [
        {
          "id": "kings-indian-black-classical",
          "name": "Classical",
          "eco": "E97",
          "reference": "King's Indian Defense: Orthodox Variation, Aronin-Taimanov Defense",
          "moves": [
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "c2",
              "c4",
              "c4"
            ],
            [
              "g7",
              "g6",
              "g6"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "f8",
              "g7",
              "Bg7",
              "Fianchetto the bishop to pressure the centre. Your central pawn breaks matter more than occupying it immediately."
            ],
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "d7",
              "d6",
              "d6"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "e8",
              "g8",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "f1",
              "e2",
              "Be2"
            ],
            [
              "e7",
              "e5",
              "e5"
            ],
            [
              "e1",
              "g1",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ]
          ]
        },
        {
          "id": "kings-indian-black-saemisch",
          "name": "Sämisch",
          "eco": "E85",
          "reference": "King's Indian Defense: Sämisch Variation, Orthodox Variation",
          "moves": [
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "c2",
              "c4",
              "c4"
            ],
            [
              "g7",
              "g6",
              "g6"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "f8",
              "g7",
              "Bg7",
              "Fianchetto the bishop to pressure the centre. Your central pawn breaks matter more than occupying it immediately."
            ],
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "d7",
              "d6",
              "d6"
            ],
            [
              "f2",
              "f3",
              "f3"
            ],
            [
              "e8",
              "g8",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "c1",
              "e3",
              "Be3"
            ],
            [
              "e7",
              "e5",
              "e5"
            ]
          ]
        }
      ]
    },
    {
      "id": "catalan-white",
      "name": "Catalan Opening",
      "side": "white",
      "level": 4,
      "lines": [
        {
          "id": "catalan-white-open",
          "name": "Open Catalan",
          "eco": "E05",
          "reference": "Catalan Opening: Open Defense, Classical Line",
          "moves": [
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "c2",
              "c4",
              "c4"
            ],
            [
              "e7",
              "e6",
              "e6"
            ],
            [
              "g2",
              "g3",
              "g3",
              "Prepare a bishop on g2 to put lasting pressure on the long diagonal, especially the queenside."
            ],
            [
              "d7",
              "d5",
              "d5"
            ],
            [
              "f1",
              "g2",
              "Bg2"
            ],
            [
              "d5",
              "c4",
              "dxc4"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "f8",
              "e7",
              "Be7"
            ],
            [
              "e1",
              "g1",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "e8",
              "g8",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ]
          ]
        },
        {
          "id": "catalan-white-closed",
          "name": "Closed Catalan",
          "eco": "E07",
          "reference": "Catalan Opening: Closed",
          "moves": [
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "c2",
              "c4",
              "c4"
            ],
            [
              "e7",
              "e6",
              "e6"
            ],
            [
              "g2",
              "g3",
              "g3",
              "Prepare a bishop on g2 to put lasting pressure on the long diagonal, especially the queenside."
            ],
            [
              "d7",
              "d5",
              "d5"
            ],
            [
              "f1",
              "g2",
              "Bg2"
            ],
            [
              "f8",
              "e7",
              "Be7"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "e8",
              "g8",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "e1",
              "g1",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "b8",
              "d7",
              "Nbd7"
            ]
          ]
        }
      ]
    },
    {
      "id": "dragon-black",
      "name": "Sicilian Dragon",
      "side": "black",
      "level": 4,
      "lines": [
        {
          "id": "dragon-black-yugoslav",
          "name": "Yugoslav setup",
          "eco": "B76",
          "reference": "Sicilian Defense: Dragon Variation, Yugoslav Attack",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "c7",
              "c5",
              "c5"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "d7",
              "d6",
              "d6"
            ],
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "c5",
              "d4",
              "cxd4"
            ],
            [
              "f3",
              "d4",
              "Nxd4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "g7",
              "g6",
              "g6",
              "Prepare the g7 bishop’s long diagonal. Sharp play often follows because White can attack on the kingside."
            ],
            [
              "c1",
              "e3",
              "Be3"
            ],
            [
              "f8",
              "g7",
              "Bg7"
            ],
            [
              "f2",
              "f3",
              "f3"
            ],
            [
              "e8",
              "g8",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "d1",
              "d2",
              "Qd2"
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ]
          ]
        },
        {
          "id": "dragon-black-classical",
          "name": "Classical",
          "eco": "B73",
          "reference": "Sicilian Defense: Dragon Variation, Classical Variation, Battery Variation",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "c7",
              "c5",
              "c5"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "d7",
              "d6",
              "d6"
            ],
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "c5",
              "d4",
              "cxd4"
            ],
            [
              "f3",
              "d4",
              "Nxd4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "g7",
              "g6",
              "g6",
              "Prepare the g7 bishop’s long diagonal. Sharp play often follows because White can attack on the kingside."
            ],
            [
              "f1",
              "e2",
              "Be2"
            ],
            [
              "f8",
              "g7",
              "Bg7"
            ],
            [
              "e1",
              "g1",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "e8",
              "g8",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ]
          ]
        }
      ]
    },
    {
      "id": "tarrasch-black",
      "name": "Tarrasch Defence",
      "side": "black",
      "level": 4,
      "lines": [
        {
          "id": "tarrasch-black-main",
          "name": "Main line",
          "eco": "D34",
          "reference": "Tarrasch Defense: Classical Variation",
          "moves": [
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "d7",
              "d5",
              "d5"
            ],
            [
              "c2",
              "c4",
              "c4"
            ],
            [
              "e7",
              "e6",
              "e6"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "c7",
              "c5",
              "c5",
              "Strike at d4 immediately with the c-pawn, accepting structural commitments for active piece play."
            ],
            [
              "c4",
              "d5",
              "cxd5"
            ],
            [
              "e6",
              "d5",
              "exd5"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ],
            [
              "g2",
              "g3",
              "g3"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "f1",
              "g2",
              "Bg2"
            ],
            [
              "f8",
              "e7",
              "Be7"
            ]
          ]
        }
      ]
    },
    {
      "id": "najdorf-black",
      "name": "Sicilian Najdorf",
      "side": "black",
      "level": 5,
      "lines": [
        {
          "id": "najdorf-black-english",
          "name": "English Attack",
          "eco": "B90",
          "reference": "Sicilian Defense: Najdorf Variation, English Attack",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "c7",
              "c5",
              "c5"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "d7",
              "d6",
              "d6"
            ],
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "c5",
              "d4",
              "cxd4"
            ],
            [
              "f3",
              "d4",
              "Nxd4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "a7",
              "a6",
              "a6",
              "Control b5 and keep your central structure flexible. Small move-order differences can have large tactical effects."
            ],
            [
              "c1",
              "e3",
              "Be3"
            ],
            [
              "e7",
              "e5",
              "e5"
            ],
            [
              "d4",
              "b3",
              "Nb3"
            ],
            [
              "c8",
              "e6",
              "Be6"
            ],
            [
              "f2",
              "f3",
              "f3"
            ],
            [
              "f8",
              "e7",
              "Be7"
            ]
          ]
        },
        {
          "id": "najdorf-black-bg5",
          "name": "Bg5 main line",
          "eco": "B98",
          "reference": "Sicilian Defense: Najdorf Variation, Traditional Line",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "c7",
              "c5",
              "c5"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "d7",
              "d6",
              "d6"
            ],
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "c5",
              "d4",
              "cxd4"
            ],
            [
              "f3",
              "d4",
              "Nxd4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "a7",
              "a6",
              "a6",
              "Control b5 and keep your central structure flexible. Small move-order differences can have large tactical effects."
            ],
            [
              "c1",
              "g5",
              "Bg5"
            ],
            [
              "e7",
              "e6",
              "e6"
            ],
            [
              "f2",
              "f4",
              "f4"
            ],
            [
              "f8",
              "e7",
              "Be7"
            ],
            [
              "d1",
              "f3",
              "Qf3"
            ],
            [
              "d8",
              "c7",
              "Qc7"
            ]
          ]
        }
      ]
    },
    {
      "id": "gruenfeld-black",
      "name": "Grünfeld Defence",
      "side": "black",
      "level": 5,
      "lines": [
        {
          "id": "gruenfeld-black-exchange",
          "name": "Exchange",
          "eco": "D85",
          "reference": "Grünfeld Defense: Exchange Variation, Modern Exchange Variation",
          "moves": [
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "c2",
              "c4",
              "c4"
            ],
            [
              "g7",
              "g6",
              "g6"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "d7",
              "d5",
              "d5",
              "Challenge the centre with pieces and pawn breaks, even if White gains a large pawn centre after exchanges."
            ],
            [
              "c4",
              "d5",
              "cxd5"
            ],
            [
              "f6",
              "d5",
              "Nxd5"
            ],
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "d5",
              "c3",
              "Nxc3"
            ],
            [
              "b2",
              "c3",
              "bxc3"
            ],
            [
              "f8",
              "g7",
              "Bg7"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "c7",
              "c5",
              "c5"
            ]
          ]
        },
        {
          "id": "gruenfeld-black-russian",
          "name": "Russian Qb3",
          "eco": "D97",
          "reference": "Grünfeld Defense: Russian Variation, Prins Variation",
          "moves": [
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "c2",
              "c4",
              "c4"
            ],
            [
              "g7",
              "g6",
              "g6"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "d7",
              "d5",
              "d5",
              "Challenge the centre with pieces and pawn breaks, even if White gains a large pawn centre after exchanges."
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "f8",
              "g7",
              "Bg7"
            ],
            [
              "d1",
              "b3",
              "Qb3"
            ],
            [
              "d5",
              "c4",
              "dxc4"
            ],
            [
              "b3",
              "c4",
              "Qxc4"
            ],
            [
              "e8",
              "g8",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "b8",
              "a6",
              "Na6"
            ]
          ]
        }
      ]
    },
    {
      "id": "semi-slav-black",
      "name": "Semi-Slav Defence",
      "side": "black",
      "level": 5,
      "lines": [
        {
          "id": "semi-slav-black-meran",
          "name": "Meran",
          "eco": "D47",
          "reference": "Semi-Slav Defense: Meran Variation, Lundin Variation",
          "moves": [
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "d7",
              "d5",
              "d5"
            ],
            [
              "c2",
              "c4",
              "c4"
            ],
            [
              "c7",
              "c6",
              "c6"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "e7",
              "e6",
              "e6",
              "Build a strong central pawn chain. The c8 bishop needs a route out, and the timing of pawn breaks is crucial."
            ],
            [
              "e2",
              "e3",
              "e3"
            ],
            [
              "b8",
              "d7",
              "Nbd7"
            ],
            [
              "f1",
              "d3",
              "Bd3"
            ],
            [
              "d5",
              "c4",
              "dxc4"
            ],
            [
              "d3",
              "c4",
              "Bxc4"
            ],
            [
              "b7",
              "b5",
              "b5"
            ]
          ]
        },
        {
          "id": "semi-slav-black-bg5",
          "name": "Against Bg5",
          "eco": "D43",
          "reference": "Semi-Slav Defense: Anti-Moscow Gambit",
          "moves": [
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "d7",
              "d5",
              "d5"
            ],
            [
              "c2",
              "c4",
              "c4"
            ],
            [
              "c7",
              "c6",
              "c6"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "e7",
              "e6",
              "e6",
              "Build a strong central pawn chain. The c8 bishop needs a route out, and the timing of pawn breaks is crucial."
            ],
            [
              "c1",
              "g5",
              "Bg5"
            ],
            [
              "h7",
              "h6",
              "h6"
            ],
            [
              "g5",
              "h4",
              "Bh4"
            ],
            [
              "d5",
              "c4",
              "dxc4"
            ]
          ]
        }
      ]
    },
    {
      "id": "benoni-black",
      "name": "Modern Benoni",
      "side": "black",
      "level": 5,
      "lines": [
        {
          "id": "benoni-black-classical",
          "name": "Classical",
          "eco": "A65",
          "reference": "Benoni Defense: King's Pawn Line",
          "moves": [
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "c2",
              "c4",
              "c4"
            ],
            [
              "c7",
              "c5",
              "c5"
            ],
            [
              "d4",
              "d5",
              "d5"
            ],
            [
              "e7",
              "e6",
              "e6",
              "Trade a central pawn for a flank pawn, accepting less space in return for active counterplay."
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "e6",
              "d5",
              "exd5"
            ],
            [
              "c4",
              "d5",
              "cxd5"
            ],
            [
              "d7",
              "d6",
              "d6"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "g7",
              "g6",
              "g6"
            ],
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "f8",
              "g7",
              "Bg7"
            ],
            [
              "f1",
              "e2",
              "Be2"
            ],
            [
              "e8",
              "g8",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ]
          ]
        },
        {
          "id": "benoni-black-fianchetto",
          "name": "Fianchetto",
          "eco": "A65",
          "reference": "Benoni Defense: King's Pawn Line",
          "moves": [
            [
              "d2",
              "d4",
              "d4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "c2",
              "c4",
              "c4"
            ],
            [
              "c7",
              "c5",
              "c5"
            ],
            [
              "d4",
              "d5",
              "d5"
            ],
            [
              "e7",
              "e6",
              "e6",
              "Trade a central pawn for a flank pawn, accepting less space in return for active counterplay."
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "e6",
              "d5",
              "exd5"
            ],
            [
              "c4",
              "d5",
              "cxd5"
            ],
            [
              "d7",
              "d6",
              "d6"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "g7",
              "g6",
              "g6"
            ],
            [
              "g2",
              "g3",
              "g3"
            ],
            [
              "f8",
              "g7",
              "Bg7"
            ],
            [
              "f1",
              "g2",
              "Bg2"
            ],
            [
              "e8",
              "g8",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ]
          ]
        }
      ]
    },
    {
      "id": "open-sicilian-white",
      "name": "Open Sicilian",
      "side": "white",
      "level": 5,
      "lines": [
        {
          "id": "open-sicilian-white-najdorf",
          "name": "Against the Najdorf",
          "eco": "B90",
          "reference": "Sicilian Defense: Najdorf Variation, English Attack",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "c7",
              "c5",
              "c5"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "d7",
              "d6",
              "d6"
            ],
            [
              "d2",
              "d4",
              "d4",
              "Open the centre and develop actively. Black’s different pawn structures require different plans."
            ],
            [
              "c5",
              "d4",
              "cxd4"
            ],
            [
              "f3",
              "d4",
              "Nxd4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "a7",
              "a6",
              "a6"
            ],
            [
              "c1",
              "e3",
              "Be3"
            ],
            [
              "e7",
              "e5",
              "e5"
            ],
            [
              "d4",
              "b3",
              "Nb3"
            ],
            [
              "c8",
              "e6",
              "Be6"
            ],
            [
              "f2",
              "f3",
              "f3"
            ],
            [
              "f8",
              "e7",
              "Be7"
            ]
          ]
        },
        {
          "id": "open-sicilian-white-dragon",
          "name": "Against the Dragon",
          "eco": "B76",
          "reference": "Sicilian Defense: Dragon Variation, Yugoslav Attack",
          "moves": [
            [
              "e2",
              "e4",
              "e4"
            ],
            [
              "c7",
              "c5",
              "c5"
            ],
            [
              "g1",
              "f3",
              "Nf3"
            ],
            [
              "d7",
              "d6",
              "d6"
            ],
            [
              "d2",
              "d4",
              "d4",
              "Open the centre and develop actively. Black’s different pawn structures require different plans."
            ],
            [
              "c5",
              "d4",
              "cxd4"
            ],
            [
              "f3",
              "d4",
              "Nxd4"
            ],
            [
              "g8",
              "f6",
              "Nf6"
            ],
            [
              "b1",
              "c3",
              "Nc3"
            ],
            [
              "g7",
              "g6",
              "g6"
            ],
            [
              "c1",
              "e3",
              "Be3"
            ],
            [
              "f8",
              "g7",
              "Bg7"
            ],
            [
              "f2",
              "f3",
              "f3"
            ],
            [
              "e8",
              "g8",
              "O-O",
              "Move the king away from the centre and bring a rook into play."
            ],
            [
              "d1",
              "d2",
              "Qd2"
            ],
            [
              "b8",
              "c6",
              "Nc6"
            ]
          ]
        }
      ]
    }
  ]
};

if (typeof module !== "undefined") module.exports = REPERTOIRE;
