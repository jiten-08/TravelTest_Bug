function SearchTabs({ activeTab, onChange }) {
  const tabs = [
    { id: 'flights', label: 'Flights', testId: 'home-flight-tab-button' },
    { id: 'hotels', label: 'Hotels', testId: 'home-hotel-tab-button' },
  ];

  return (
    <div className="inline-flex rounded-2xl bg-slate-100 p-1" data-testid="home-search-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={[
            'rounded-xl px-4 py-2 text-sm font-bold transition-all focus-ring',
            activeTab === tab.id ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-900',
          ].join(' ')}
          data-testid={tab.testId}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default SearchTabs;
