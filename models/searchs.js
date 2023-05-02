import axios from 'axios';
import fs from "fs";


export class Searchs {
    
    history = [];
    dbPath = './db/database.json';

    constructor(){
        this.readDB()
    }

    get capitalizedHistory(){
        return this.history.map( place => {
            let words = place.split(' ');
            words = words.map(p => p[0].toUpperCase() + p.substring(1) );
            return words.join(' ');
        })
    }

    get paramsMapbox() {
        return {
            'language': 'es',
            'access_token': process.env.MAPBOX_KEY,
            'limit':5
        }
    }

    get paramsOpenWeather() {
        return {
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es'
        }
    }

    async city( place = '' ) {
        
        try {
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ place }.json`,
                params: this.paramsMapbox
                
            })
            const resp = await instance.get();
            //De esta forma regreso un bojeto de forma implicita
            return resp.data.features.map( place => ({
                id: place.id,
                name: place.place_name,
                lgn: place.center[0],
                lat: place.center[1]
            }));

        } catch (error) {
            return [];
        }
    }

    async weatherInPlace( lat, lon ) {
        try {
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsOpenWeather, lat, lon}
            });

            const resp = await instance.get();
            const { weather, main } = resp.data;
            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            };

        } catch (error) {
            console.log(error);
        }
    }

    async addHistory( place = '') {
        if( this.history.includes(place.toLowerCase()) ) return;
        this.history = this.history.splice(0, 4);
        this.history.unshift( place.toLowerCase() );
        this.saveDB();
    }

    saveDB(){

        const payload = {
            history: this.history
        }

        fs.writeFileSync( this.dbPath, JSON.stringify( payload ));
    }

    readDB() {
        if(!fs.existsSync(this.dbPath)) return null;

        const file = fs.readFileSync(this.dbPath, { encoding: "utf-8"});
        const data = JSON.parse(file);
        
        this.history = data.history;
    }

}