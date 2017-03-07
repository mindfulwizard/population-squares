function APICall(url) {
    return $.ajax({
        url: url,
        method: 'GET',
        dataType: 'jsonp'
    });
}

function smallestNames(arr) {
    return arr.reduce((acc, curr) => {
        if(!acc.length || curr.length < acc[0].length) {
            return [curr];
        }
        if(curr.length === acc[0].length) {
            return acc.concat(curr);
        }
        return acc;
    }, []);
}

function populationReducer(arr) {
    return arr.reduce((acc, curr) => {
        if(!acc.name) {
            acc.name = curr.country;
            acc.population = 0;
        }
        acc.population += curr.total;
        return acc;
    }, {});
}

function getData() {       
    const url = 'https://population.simonsfoundation.org/countries';
    return APICall(url)
        .then(data => {
            const countryNames = smallestNames(data.countries);
            const newUrl = 'https://population.simonsfoundation.org/population/';
            return Promise.all(countryNames.map(name => APICall(newUrl + '2017/' + name)))
        })
        .then(data => {
            return data.map(popTables => populationReducer(popTables))
            .sort((a,b) => a.population > b.population ? -1 : 1).slice(0,5);
         });
}

function handleClick(e) {
    e.stopPropagation();
    this.className = 'square red';
    const country = this.getAttribute('data-name');
    const url = 'https://population.simonsfoundation.org/population/';
    APICall(url + country + '/18')
        .then(data => {
            const infoObj = data.find((obj) => obj.year === 2016);
            const totalPlus = infoObj.males + infoObj.females + infoObj.total;
            this.childNodes[1].innerHTML = '<div>PopulationPlus: ' + totalPlus + '</div>';
        });
}

const squares = document.querySelectorAll('.square');

getData()
    .then(data => {
        let i = 0;
        squares.forEach((el, idx) => {
            if(idx % 2 == 0) {
                el.innerHTML = '<h3>' + data[i].name + '</h3><div>Population: ' + data[i].population + '</div>';
                el.className = 'square blue';
                el.setAttribute('data-name', data[i].name);
                el.addEventListener('click', handleClick);
                i++;
            }
        }); 
    });
