import React from 'react';
import request from 'superagent';

import Logo from './logo';

/**
 * Handles the Loader inside the app, as it's only one page we can hard code it all
 */

class Loader extends React.Component {

  constructor () {

    super();

    this.isLoaded = this.isLoaded.bind(this);

    this.state = {
      data: [],
      loaded: 0
    }

  }

  componentDidMount () {

    this.getS3ImageList().
      then((data) => {

        this.setState({
          data
        })

        this.loadImages(this.state.data);

      })
      .catch((err) => {

        console.log(err);

      })

  }

  getS3ImageList () {

    // initialise the loader by making a request for the S3 images

    const host = window.location;
    const url = `${ host }s3`;

    return new Promise((resolve, reject) => {
      request
        .get(url)
        .end((err, res) => {

          if(err) reject();

          resolve(res.body);

        });
    })

  }

  getPercentage () {

    const calc = Math.round((100 / this.state.data.length) * this.state.loaded);
    const count = isNaN(calc) ? 0 : calc;

    return calc + '%';

  }

  loadImages (sources) {

    const loadImg = (src) => {

      return new Promise((resolve, reject) => {

        let img = new Image();

        img.onload = () => {

          // Incremement the state by 1
          this.updateLoadedState();

          // Resolve
          resolve(img);
        }

        img.onerror = () => {
          reject(src);
        }

        img.src = src;

      })

    }

    let promises =[];

    for(let i = 0; i < sources.length; i++){

      promises.push(loadImg(sources[i]));

    }

    return Promise.all(promises);

  }

  updateLoadedState () {

    const currentLoaded = this.state.loaded;

    this.setState({
      loaded: currentLoaded + 1
    })

    return;

  }

  isLoaded () {

    return (this.state.loaded !== 0 && this.state.loaded === this.state.data.length);

  }

  render () {

    const done = this.isLoaded() ? 'done' : '';

    return (

      <div className={ `loader container-fluid ${ done }` }>
        <div className="row">
          <p style={{ color: 'white' }}>Debug: { this.getPercentage }</p>
          <span className="logo">
            <Logo />
          </span>
          <div className={ `left-load col-xs-12 col-sm-6 col-md-6 ${ done }`}>

          </div>
          <div className={ `right-load col-xs-12 col-sm-6 col-md-6 ${ done }`}>

          </div>
        </div>
      </div>
    );
  }
}

export default Loader;
