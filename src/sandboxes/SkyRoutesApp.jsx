import React, { useState } from 'react';
import { Plane, Calendar, Users, ArrowRight, AlertTriangle, ArrowLeftRight } from 'lucide-react';

export default function SkyRoutesApp({ activeBugs, addLog }) {
  const [departureCity, setDepartureCity] = useState('New York (JFK)');
  const [destinationCity, setDestinationCity] = useState('London (LHR)');
  const [departDate, setDepartDate] = useState('2026-08-25');
  const [returnDate, setReturnDate] = useState('2026-08-15');
  const [adults, setAdults] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [basePriceUSD, setBasePriceUSD] = useState(500);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [dateError, setDateError] = useState('');

  const handleCurrencyToggle = () => {
    const bugCurrencyDouble = activeBugs.includes('sky_currency_double');

    if (currency === 'USD') {
      setCurrency('EUR');
      setBasePriceUSD(prev => prev * 0.90);
      addLog('network', 'SkyRoutes Currency', 'Switched display currency to EUR (€)');
    } else {
      setCurrency('USD');
      if (bugCurrencyDouble) {
        setBasePriceUSD(prev => prev * 1.23);
        addLog('warn', 'SkyRoutes Currency Bug', 'Currency toggled back to USD, but base price inflated due to double rate application.');
      } else {
        setBasePriceUSD(500);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setDateError('');

    const bugReturnDate = activeBugs.includes('sky_return_date');
    const bugPassengerZero = activeBugs.includes('sky_passenger_zero');
    const dep = new Date(departDate);
    const ret = new Date(returnDate);

    if (!bugReturnDate && ret < dep) {
      setDateError('Invalid Date Selection: Return date cannot be earlier than departure date.');
      addLog('error', 'SkyRoutes Date Validation', `Rejected return date (${returnDate}) prior to departure date (${departDate}).`);
      return;
    } else if (bugReturnDate && ret < dep) {
      addLog('warn', 'SkyRoutes Logic Flaw', `Accepted return date (${returnDate}) before departure date (${departDate}).`);
    }

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
    <div className="space-y-6 animate-fade-in">
      <div className="app-chrome">
        <div className="flex items-center gap-3">
          <div className="app-icon bg-gradient-to-br from-cyan-600 to-blue-500">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary flex flex-wrap items-center gap-2">
              SkyRoutes Flight Search
              <span className="badge badge-medium">Travel Booking</span>
            </h2>
            <p className="text-xs text-secondary">Date order · currency math · zero-passenger boundary</p>
          </div>
        </div>

        <button type="button" onClick={handleCurrencyToggle} className="btn btn-ghost font-mono text-cyan-300">
          <ArrowLeftRight className="w-3.5 h-3.5" />
          {currency} ({currencySymbol})
        </button>
      </div>

      <div className="max-w-3xl mx-auto glass-panel p-6 rounded-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-primary">Search Round-Trip Flights</h3>
          <span className="text-xs text-muted font-mono">Base: {currencySymbol}{basePriceUSD.toFixed(2)}</span>
        </div>

        {dateError && (
          <div className="alert alert-error">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{dateError}</span>
          </div>
        )}

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">Departure City</label>
              <select value={departureCity} onChange={(e) => setDepartureCity(e.target.value)} className="glass-input">
                <option>New York (JFK)</option>
                <option>San Francisco (SFO)</option>
                <option>Tokyo (HND)</option>
                <option>London (LHR)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">Destination City</label>
              <select value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} className="glass-input">
                <option>London (LHR)</option>
                <option>Paris (CDG)</option>
                <option>Dubai (DXB)</option>
                <option>Singapore (SIN)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Departure Date
              </label>
              <input
                type="date"
                required
                value={departDate}
                onChange={(e) => setDepartDate(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                className="glass-input cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Return Date
              </label>
              <input
                type="date"
                required
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                className="glass-input cursor-pointer"
              />
              <p className="text-[10px] text-muted mt-1">Compare return date with departure</p>
            </div>
          </div>

          <div className="surface-muted rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-sm font-bold text-primary block">Adult Passengers</span>
                <span className="text-[10px] text-muted">Min 1 required for valid fare</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAdults(prev => Math.max(0, prev - 1))}
                className="w-8 h-8 rounded-lg bg-[var(--bg-hover)] hover:bg-indigo-600 hover:text-white text-primary flex items-center justify-center font-bold transition"
              >
                −
              </button>
              <span className="font-mono text-sm font-bold text-cyan-400 w-6 text-center">{adults}</span>
              <button
                type="button"
                onClick={() => setAdults(prev => prev + 1)}
                className="w-8 h-8 rounded-lg bg-[var(--bg-hover)] hover:bg-indigo-600 hover:text-white text-primary flex items-center justify-center font-bold transition"
              >
                +
              </button>
            </div>
          </div>

          <button type="submit" className="btn w-full py-3 text-sm text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:brightness-110 shadow-lg shadow-cyan-500/20">
            Search Available Flights <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {searchSubmitted && (
          <div className="pt-4 border-t border-[var(--border)] space-y-3 animate-fade-in">
            <h4 className="section-label">Available Results</h4>
            <div className="surface-muted rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-cyan-500/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                  <span>{departureCity}</span>
                  <Plane className="w-4 h-4 text-cyan-400" />
                  <span>{destinationCity}</span>
                </div>
                <div className="text-xs text-muted font-mono">
                  {departDate} → {returnDate} · {adults} {adults === 1 ? 'Passenger' : 'Passengers'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-mono font-extrabold text-cyan-400">
                  {currencySymbol}{(basePriceUSD * adults).toFixed(2)}
                </div>
                <button
                  type="button"
                  onClick={() => addLog('network', 'SkyRoutes Flight', 'Flight ticket booked!')}
                  className="btn mt-1.5 px-3 py-1 text-[11px] text-white bg-cyan-600 hover:bg-cyan-500"
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
