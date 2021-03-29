'use strict';

let request   = require('request');
let errCodes  = require('./error-codes');
const ApiPath = 'https://api.checkmobi.com/v1/';

/**
 * Send request on API server and revert response
 * by calling callback
 *
 * @param  {Object} opt         NPM Request option Object
 * @param  {function} _callback
 */
let __request = function __request(opt, _callback) {

  return request(opt, (error, response, body) => {

    if(error) return _callback(true, error.message);

    if(!error && response.statusCode != 200 && response.statusCode != 204) {
      switch (response.statusCode) {
        case 400:
        case 401:
          _callback(true, JSON.parse(body)["error"]);
          break;
        case 403:
          _callback(true, errCodes['403']);
          break;
        case 404:
          _callback(true, errCodes['404']);
          break;
        case 500:
          _callback(true, errCodes['500']);
          break;
      }
      return ;
    }

    return _callback(false, JSON.parse(body));
  });
}

/**
 * HTTP Request class to send request
 * on API server and received response
 *
 * This implements callback pattern
 */
class CbRequest {

  /**
   * Class constructor
   * @param  {String} apiSecret
   */
  constructor(apiSecret) {
    this.headers = {
      'Authorization': apiSecret,
      'Content-Type': 'application/json'
    }

    this.apiUri = {
      'countries': 'countries',
      'prefixes': 'prefixes',
      'checknumber': 'checknumber',
      'checknumber': 'checknumber',
      'validateNum': 'validation/request',
      'validatePin': 'validation/verify',
      'validateStatus': 'validation/status/{id}',
      'remote-config': 'validation/remote-config',
      'sendSms': 'sms/send',
      'getSms': 'sms/{id}'
    };
  }

  /**
   * Send request on API server
   *
   * @param  {String}   reqType     HTTP methods values: post, get
   * @param  {String}   reqFor      API URI code
   * @param  {Mixed}    payload     Object or String
   * @param  {Function} _callback
   */
  doRequest(reqType, reqFor, payload, _callback, ip) {
    /**
     * Request module options
     * @type {Object}
     */
    let options = {
      'method': reqType,
      'url': ApiPath + this.apiUri[reqFor],
      'headers': this.headers
    };
    if(ip)
      this.headers['X-Client-IP'] = ip;
    console.log(this.headers)

    // Create form object support by API
    if(payload && reqType.toLowerCase() === 'post') {
      options['form'] = JSON.stringify(payload);
    }

    // Validate ID format for get request
    if(
      payload &&
      (this.apiUri[reqFor].indexOf('{id}') >= 0) &&
      (reqType.toLowerCase() === 'get')
    ) {
      options.url = options.url.replace('{id}', payload);
    }

    // Send response
    return __request(options, _callback);
  }
}

exports.CBRequest = CbRequest;
