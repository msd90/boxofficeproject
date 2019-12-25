import React from 'react';
import {result, date} from './sandbox.js';
import './films.css';
import Spinner from './Spinner';


export default class Films extends React.Component {
  constructor(props){
    super(props)
    

    this.state = { film: [[],[],[]],
                   gross: [[],[],[]],
                   total: [[],[],[]],
                  loading:<Spinner />}
    //console.log('cons')
    

    
  }

 async componentDidMount() {
  
  const value = await result;
  const latest_date = await date;
  
 

   this.setState( (state, props) => { 
       
        return {film:value[0],
                gross:value[1],
              total:value[2],
              date:latest_date,
              loading:''
              }
    });
   
  }

  render (){


    const entry = []
    for (var i=0; i<this.state.film.length;i++) {
      if(i===30){
        break;
      }

      entry.push(<tr key = {i}><td key={0}>{i+1}</td><td key={1}>{this.state.film[i]}</td><td key={2}>{this.state.gross[i]}</td><td key={3}>{this.state.total[i]}</td></tr>);
    }
   
    return (
      <div>
        <div id = 'Spinner'>
          {this.state.loading}
          </div>
        <div id ='Header'>
       <h1> Weekend Box Office </h1>
       </div>
       <div className="Box">
        <div className = 'data'>
            <center><p>Here are the latest box office results by weekend gross: </p></center>
            <center><h4>{this.state.date}</h4></center>
          
    <table id="filmList" align='center'>
    <tbody>
    <tr>
        <th>Rank</th>
        <th>Film</th>
        <th>Weekend Gross</th>
        <th>Total Gross</th>
    </tr>
        {entry}
        </tbody>
      </table>
      <div id = 'sourceInfo'><p>Information provided by <a href="https://www.boxofficemojo.com/weekend/chart/"> Box Office Mojo</a></p></div>
            
    </div>
  </div>
</div>
    );
  }
}