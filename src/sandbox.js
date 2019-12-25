const axios = require('axios')
var cheerio = require('cheerio')

//https://sheltered-eyrie-45123.herokuapp.com/ --> is a url that enables cross-origin requests anywhere
var url = 'https://sheltered-eyrie-45123.herokuapp.com/https://www.boxofficemojo.com/weekend/chart/';

const result = axios.get(url).then(function (response) {
    
    
    var loadHTML = cheerio.load(response.data);
    var films = getTitles(loadHTML);
    var gross = getGross(loadHTML);

    var today = new Date(); 

    /*If the array is empty OR 
    if today is a Saturday or Sunday OR 
    if today is a Monday before 6 AM use last week's box office results*/
    if(gross===null || (today.getDay() === 6 || today.getDay() === 0) || (today.getDay()===1 && today.getHours() < 6))
    {
        var bkup = useBackUpLink();
        return bkup
    }

    var Dataset = [];
    Dataset.push(films);
    Dataset.push(gross[0]);
    Dataset.push(gross[2]);

    //Dataset is a 2D array configured as follows: Dataset[0] lists all films, 
    //Dataset[1] lists all gross weekend revenue by film (descending order)
    //Dataset[2] list all gross total revenue by film (descending order)

    //console.log(Dataset[0])
    

    return Dataset;

})

//returns an array of ranked box office film titles
function getTitles($){
    var list = [];
    var film_titles = [];

    $('.a-link-normal').each( function () {
        var link = $(this).text();
        list.push(link);
        //console.log(link);
     });

     // eslint-disable-next-line
     var startIndex = 0;
     for(var i=0;i< list.length;i++){
         if(list[i] === 'Weeks'){
             startIndex = i;
         }
     }
     
      // eslint-disable-next-line
     for(var i=0;i<startIndex+1;i++){
        list.shift();
     }

     

     // eslint-disable-next-line
     for(var i=0;i<list.length;i++){
         if(list[i].includes('\n')===true){
            continue
        }
        if(list[i]===''){
            break;
        }
        else{
            film_titles.push(list[i])
        }
    }
     
   // console.log(film_titles);
    
    return film_titles;
}

//returns a 2D array as [weekend gross elements, gross per theater elements, total gross]
function getGross($){

    //get all values that start with $ and push them into an array called 'list'
    let data = $.html('td');
    var list = data.match(/\$[0-9]*,*[0-9]*,*[0-9]*/gm)
    var wkd_gross_list = [];
    var gross_per_theatre = [];
    var total_gross = [];

    

    if(list===null){
        return null;
    }

    //if the second value does not have 6 figures, then it means that the function has picked up the gross/per theater value
    //push the wkd gross, gross/theater, and total gross into three separate arrays
    if(list[1].length >= 6){

        for(var i=0;i<list.length;i++){
            wkd_gross_list.push(list[i])
            list.shift();
            gross_per_theatre.push(list[i]);
            list.shift();
            total_gross.push(list[i]);
        }
    }

//if the second value does not have a 6 figure value, then it means the function has only picked up the wkd and total gross.
//push those values into two separate arrays
    if(list[1].length !== 6){
        // eslint-disable-next-line
        for(var i=0;i<list.length;i++){
            wkd_gross_list.push(list[i])
            list.shift();
            total_gross.push(list[i]);
        }
    }

  

    
   
    var DataSet = [wkd_gross_list,gross_per_theatre,total_gross];

    return DataSet;     
    
}

const date = axios.get('https://sheltered-eyrie-45123.herokuapp.com/https://www.boxofficemojo.com/weekend/chart/').then(function (response) {

	var $ = cheerio.load(response.data);
    let title = $('h4').first();
    var d = new Date();

    //If today is Sunday, Saturday or Friday get last week's date else get this weeks date
    if(d.getDay() === 0| d.getDay() === 5 | d.getDay() === 6){
        var weekNumber = getWeekNumber(new Date());
        var url = 'https://sheltered-eyrie-45123.herokuapp.com/https://www.boxofficemojo.com/weekend/'
        url = url.concat(weekNumber[0],'W',weekNumber[1]);
        var bkup_date = axios.get(url).then(function (response) {
            var $ = cheerio.load(response.data);
            let title = $('h4').first();
            return title.text();
            
        })
        return bkup_date;
    }
    else{
        return title.text();
    }

})

function useBackUpLink(){
    url = 'https://sheltered-eyrie-45123.herokuapp.com/https://www.boxofficemojo.com/weekend/'
    var weekNumber = getWeekNumber(new Date());

    /*On the boxofficemojo website, you will see at the end of the weekend box office url
    it ends with 2019W{Week # of the year} (ex. last week of the year 2019 = 2019W52) 
    
    Below modifies the back up link to show last weeks box office numbers*/
    url = url.concat(weekNumber[0],'W',weekNumber[1]);
    //console.log(url)

    var web_data = axios.get(url).then(function (response) {


        var loadHTML = cheerio.load(response.data);
        var films = getTitles(loadHTML);
        var gross = getGross(loadHTML);

        var DS = [];
        DS.push(films);
        DS.push(gross[0]);
        DS.push(gross[2]);

        return DS
    })

    return web_data;
}


/*source:https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php*/
function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    //week number
    return [d.getUTCFullYear(),weekNo-1];
}


/*date.then(function (v) {
    console.log(v);
});*/


export {result, date}