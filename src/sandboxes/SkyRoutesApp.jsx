import React, { useState } from 'react';
import { Plane, Calendar, Users, DollarSign, ArrowRight, CheckCircle2, AlertTriangle, ArrowLeftRight } from 'lucide-react';

export default function SkyRoutesApp({ activeBugs, addLog }) {
  const [departureCity, setDepartureCity] = useState('New York (JFK)');
  const [destinationCity, setDestinationCity] = useState('London (LHR)');
  const [departDate, setDepartDate] = useState('2026-08-25');
  const [returnDate, setReturnDate] = useState('2026-08-15'); // Pre-set to earlier date to test candidate detection
  const [adults, setAdults] = useState(0); // Pre-set to 0 to test boundary value analysis
  const [currency, setCurrency] = useState('USD');
  const [basePriceUSD, setBasePriceUSD] = useState(500);

  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [dateError, setDateError] = useState('');

  // Currency Switch Logic
  const handleCurrencyToggle = () => {
    const bugCurrencyDouble = activeBugs.includes('sky_currency_double');
    
    if (currency === 'USD') {
      setCurrency('EUR');
      setBasePriceUSD(prev => prev * 0.90); // $500 -> €450
      addLog('network', 'SkyRoutes Currency', 'Switched display currency to EUR (€)');
    } else {
      setCurrency('USD');
      if (bugCurrencyDouble) {
        // BUG: multiplies by 1.23 instead of reverting cleanly, inflating price to $555!
        setBasePriceUSD(prev => prev * 1.23);
        addLog('warn', 'SkyRoutes Currency Bug', 'Currency toggled back to USD, but base price inflated due to double rate application.');
      } else {
        setBasePriceUSD(500); // Fixed base USD price reset
      }
    }
  };

  // Search Flight submit
  const handleSearch = (e) => {
    e.preventDefault();
    setDateError('');

    const bugReturnDate = activeBugs.includes('sky_return_date');
    const bugPassengerZero = activeBugs.includes('sky_passenger_zero');

    const dep = new Date(departDate);
    const ret = new Date(returnDate);

    // 1. Date Logic
    if (!bugReturnDate && ret < dep) {
      setDateError('Invalid Date Selection: Return date cannot be earlier than departure date.');
      addLog('error', 'SkyRoutes Date Validation', `Rejected return date (${returnDate}) prior to departure date (${departDate}).`);
      return;
    } else if (bugReturnDate && ret < dep) {
      addLog('warn', 'SkyRoutes Logic Flaw', `Accepted return date (${returnDate}) before departure date (${departDate}).`);
    }

    // 2. Passenger count check
    if (!bugPassengerZero && adults < 1) {
      setDateError('Invalid Passenger Count: Minimum 1 Adult passenger required.');
      addLog('error', 'SkyRoutes Passenger Validation', 'Rejected flight search with 0 passengers.');
      return;
    } else if (bugPassengerZero && adults < 1) {
      addLog('warn', 'SkyRoutes Boundary Flaw', `Accepted flight search with ${adults} passengers resulting in $0 booking.`);
    }

    addLog('network', 'SkyRoutes API', `POST /api/v1/flights/search - ${departureCity} to ${destinationCity}`);
    setSearchSubmitted(true);
  };

  const currencySymbol = currency === 'USD' ? '$' : '€';

  return (
    <div className="space-y-6">
      {/* App Nav Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              SkyRoutes Flight Search
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Travel Booking Sandbox
              </span>
            </h2>
            <p className="text-xs text-slate-400">Test date sequence logic, currency conversion math, and 0-passenger boundary cases</p>
          </div>
        </div>

        <button
          onClick={handleCurrencyToggle}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-2 transition"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          Currency: <span className="font-bold text-white">{currency} ({currencySymbol})</span>
        </button>
      </div>

      {/* Main Search Panel */}
      <div className="max-w-3xl mx-auto glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100">Search Round-Trip Flights</h3>
          <span className="text-xs text-slate-400 font-mono">Base Rate: {currencySymbol}{basePriceUSD.toFixed(2)}</span>
        </div>

        {dateError && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{dateError}</span>
          </div>
        )}

        <form onSubmit={handleSearch} className="space-y-4 text-xs">
          {/* Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Departure City</label>
              <select
                value={departureCity}
                onChange={(e) => setDepartureCity(e.target.value)}
                className="w-full p-2.5 glass-input rounded-lg bg-slate-900 text-slate-200"
              >
                <option>New York (JFK)</option>
                <option>San Francisco (SFO)</option>
                <option>Tokyo (HND)</option>
                <option>London (LHR)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Destination City</label>
              <select
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                className="w-full p-2.5 glass-input rounded-lg bg-slate-900 text-slate-200"
              >
                <option>London (LHR)</option>
                <option>Paris (CDG)</option>
                <option>Dubai (DXB)</option>
                <option>Singapore (SIN)</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Departure Date
              </label>
              <input
                type="date"
                required
                value={departDate}
                onChange={(e) => setDepartDate(e.target.value)}
                className="w-full p-2.5 glass-input rounded-lg text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Return Date
              </label>
              <input
                type="date"
                required
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full p-2.5 glass-input rounded-lg text-slate-200"
              />
              <p className="text-[10px] text-slate-500 mt-1">Compare return date with departure date</p>
            </div>
          </div>

          {/* Passengers */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-slate-200 font-bold block">Adult Passengers</span>
                <span className="text-[10px] text-slate-400">Min 1 required for valid fare calculation</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAdults(prev => Math.max(0, prev - 1))}
                className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 flex items-center justify-center font-bold"
              >
                -
              </button>
              <span className="font-mono text-sm font-bold text-cyan-300 px-2">{adults}</span>
              <button
                type="button"
                onClick={() => setAdults(prev => prev + 1)}
                className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            Search Available Flights <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Results */}
        {searchSubmitted && (
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available Flight Results</h4>
            
            <div className="p-4 bg-slate-900/80 border border-cyan-500/30 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <span>{departureCity}</span>
                  <Plane className="w-4 h-4 text-cyan-400" />
                  <span>{destinationCity}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {departDate} to {returnDate} • {adults} {adults === 1 ? 'Passenger' : 'Passengers'}
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-mono font-extrabold text-cyan-300">
                  {currencySymbol}{(basePriceUSD * adults).toFixed(2)}
                </div>
                <button
                  onClick={() => addLog('network', 'SkyRoutes Flight', 'Flight ticket booked!')}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded mt-1"
                >
                  Select Flight
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
