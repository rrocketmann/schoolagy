const PLACES = [
  {
    "id": "01",
    "file": "photos/01.jpg",
    "lat": 48.858,
    "lon": 2.295,
    "title": "Eiffel Tower by night, Paris, FRANCE.jpg",
    "author": "Corentin villemeur",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Eiffel_Tower_by_night,_Paris,_FRANCE.jpg"
  },
  {
    "id": "02",
    "file": "photos/02.jpg",
    "lat": 35.66,
    "lon": 139.7,
    "title": "Hachiko Entrance of Shibuya Station (JR).jpg",
    "author": "そらみみ (Soramimi)",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Hachiko_Entrance_of_Shibuya_Station_(JR).jpg"
  },
  {
    "id": "03",
    "file": "photos/03.jpg",
    "lat": -22.952,
    "lon": -43.21,
    "title": "Christ the Redeemer - From Above.jpg",
    "author": "Alexandre Cesar Salem e Silva",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Christ_the_Redeemer_-_From_Above.jpg"
  },
  {
    "id": "04",
    "file": "photos/04.jpg",
    "lat": -33.857,
    "lon": 151.215,
    "title": "Sydney Opera House, Sydney, Australia (Unsplash fLEw4UdS0D0).jpg",
    "author": "Mike Wilson mkwlsn",
    "license": "CC0",
    "source": "https://commons.wikimedia.org/wiki/File:Sydney_Opera_House,_Sydney,_Australia_(Unsplash_fLEw4UdS0D0).jpg"
  },
  {
    "id": "05",
    "file": "photos/05.jpg",
    "lat": 29.97,
    "lon": 31.128,
    "title": "All Gizah Pyramids.jpg",
    "author": "Ricardo Liberato",
    "license": "CC BY-SA 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:All_Gizah_Pyramids.jpg"
  },
  {
    "id": "06",
    "file": "photos/06.jpg",
    "lat": 41.89,
    "lon": 12.492,
    "title": "20160425 145 Roma - Colosseum (26700542276).jpg",
    "author": "Sjaak Kempe from Groningen, The Netherlands",
    "license": "CC BY 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:20160425_145_Roma_-_Colosseum_(26700542276).jpg"
  },
  {
    "id": "07",
    "file": "photos/07.jpg",
    "lat": 51.501,
    "lon": -0.125,
    "title": "Westminster, London (52252504860).jpg",
    "author": "Daniel from Glasgow, United Kingdom",
    "license": "CC BY 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Westminster,_London_(52252504860).jpg"
  },
  {
    "id": "08",
    "file": "photos/08.jpg",
    "lat": 28.613,
    "lon": 77.23,
    "title": "India Gate in evening.jpg",
    "author": "Tanny151",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:India_Gate_in_evening.jpg"
  },
  {
    "id": "09",
    "file": "photos/09.jpg",
    "lat": -33.963,
    "lon": 18.41,
    "title": "View From Table Top Mountain.jpg",
    "author": "Fz-29",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:View_From_Table_Top_Mountain.jpg"
  },
  {
    "id": "10",
    "file": "photos/10.jpg",
    "lat": 40.759,
    "lon": -73.985,
    "title": "New york times square-terabass.jpg",
    "author": "Terabass",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:New_york_times_square-terabass.jpg"
  },
  {
    "id": "11",
    "file": "photos/11.jpg",
    "lat": -13.164,
    "lon": -72.543,
    "title": "Machu Picchu, Peru.jpg",
    "author": "Pedro Szekely at https://www.flickr.com/photos/pedrosz/",
    "license": "CC BY-SA 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Machu_Picchu,_Peru.jpg"
  },
  {
    "id": "12",
    "file": "photos/12.jpg",
    "lat": 52.516,
    "lon": 13.378,
    "title": "Brandenburger Tor abends.jpg",
    "author": "Thomas Wolf , www.foto-tw.de",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Brandenburger_Tor_abends.jpg"
  },
  {
    "id": "13",
    "file": "photos/13.jpg",
    "lat": 37.828,
    "lon": -122.482,
    "title": "Golden Gate Bridge .JPG",
    "author": "Octagon",
    "license": "CC BY 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Golden_Gate_Bridge_.JPG"
  },
  {
    "id": "14",
    "file": "photos/14.jpg",
    "lat": 30.322,
    "lon": 35.452,
    "title": "Al Khazneh Petra edit 2.jpg",
    "author": "Al_Khazneh_Petra.jpg : Graham Racher from London, UK derivative work: MrPanyGoff",
    "license": "CC BY-SA 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Al_Khazneh_Petra_edit_2.jpg"
  },
  {
    "id": "15",
    "file": "photos/15.jpg",
    "lat": 41.006,
    "lon": 28.98,
    "title": "Hagia Sophia Mars 2013.jpg",
    "author": "Arild Vågen",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Hagia_Sophia_Mars_2013.jpg"
  },
  {
    "id": "16",
    "file": "photos/16.jpg",
    "lat": 43.643,
    "lon": -79.387,
    "title": "CN Tower Toronto.jpg",
    "author": "Zwergelstern",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:CN_Tower_Toronto.jpg"
  },
  {
    "id": "17",
    "file": "photos/17.jpg",
    "lat": -27.126,
    "lon": -109.289,
    "title": "Moai Rano raraku.jpg",
    "author": "Aurbina",
    "license": "Public domain",
    "source": "https://commons.wikimedia.org/wiki/File:Moai_Rano_raraku.jpg"
  },
  {
    "id": "18",
    "file": "photos/18.jpg",
    "lat": 37.971,
    "lon": 23.726,
    "title": "Parthenon from west.jpg",
    "author": "User:Mountain",
    "license": "Public domain",
    "source": "https://commons.wikimedia.org/wiki/File:Parthenon_from_west.jpg"
  },
  {
    "id": "19",
    "file": "photos/19.jpg",
    "lat": 27.173,
    "lon": 78.042,
    "title": "Taj Mahal (Edited).jpeg",
    "author": "Yann ; edited by Jim Carter",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Taj_Mahal_(Edited).jpeg"
  }
];
