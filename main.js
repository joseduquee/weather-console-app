import * as dotenv from "dotenv";
dotenv.config();
import {
  inquirerMenu,
  pause,
  readInput,
  listPlaces,
} from "./helpers/inquirer.js";
import { Searchs } from "./models/searchs.js";

const main = async () => {
  const searchs = new Searchs();

  let opt = "";

  do {
    opt = await inquirerMenu();

    switch (opt) {
      case 1:
        // Show message
        const termToSearch = await readInput("City: ");

        //Search places
        const places = await searchs.city(termToSearch);

        //Select a place
        const idSelected = await listPlaces(places);
        if( idSelected === '0') continue;

        const placeSelected = places.find((l) => l.id === idSelected);

        //Save DB
        searchs.addHistory( placeSelected.name );


        //Weather
        const weather = await searchs.weatherInPlace(
          placeSelected.lat,
          placeSelected.lgn
        );

        //Results
        console.clear();
        console.log("\nInformation of the city\n".green);
        console.log("City:".green, placeSelected.name.green);
        console.log("Lat:".green, placeSelected.lat);
        console.log("Lgn:".green, placeSelected.lgn);
        console.log("Temperature:".green, weather.temp);
        console.log("Mimimun:".green, weather.min);
        console.log("Maximal:".green, weather.max);
        console.log("Description:".green, weather.desc.green);
        break;

      case 2:
        searchs.capitalizedHistory.forEach( (place, i) => {
            const idx = `${ i + 1}`.green;
            console.log(`${ idx } ${ place }`);
        })
        break;

      default:
        break;
    }

    if (opt !== 0) {
      await pause();
    }
  } while (opt !== 0);
};

main();
