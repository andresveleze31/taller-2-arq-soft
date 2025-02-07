import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10,
  duration: '10s',
};

export default function () {
  let res = http.get('http://localhost:5000/location-http');
  check(res, {
    'status is 200 or 503': (r) => r.status === 200 || r.status === 503,
  });
}