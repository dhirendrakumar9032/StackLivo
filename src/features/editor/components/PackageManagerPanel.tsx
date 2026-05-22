export default function PackageManagerPanel({
  packageSearchRef,
  installedPackages,
  packageQuery,
  setPackageQuery,
  isSearchingPackages,
  packageError,
  packageResults,
  addingPackage,
  isPackageInstalled,
  onAddPackage,
  collapsed,
  onToggleCollapsed,
}) {
  return (
    <>
      <div className="sidebar-section-header packages">
        <button className="sidebar-collapse-button" type="button" onClick={onToggleCollapsed}>
          <span>{collapsed ? "▸" : "▾"}</span>
          <h3>NPM PACKAGES</h3>
        </button>
        <button
          type="button"
          className="mini-button"
          onClick={() => {
            if (collapsed) {
              onToggleCollapsed();
              window.setTimeout(() => packageSearchRef.current?.focus(), 0);
              return;
            }

            packageSearchRef.current?.focus();
          }}
          title="Search package"
        >
          +
        </button>
      </div>

      {!collapsed ? (
        <>
          <div className="packages-list">
            {installedPackages.map(([packageName, version]) => (
              <div className="package-item" key={packageName}>
                <span>{packageName}</span>
                <small>{version}</small>
              </div>
            ))}
          </div>

          <div className="package-search-wrap">
            <input
              ref={packageSearchRef}
              type="text"
              value={packageQuery}
              onChange={(event) => setPackageQuery(event.target.value)}
              placeholder="Search package (lodash)"
            />
          </div>

          {isSearchingPackages ? <p className="status-line">Searching packages...</p> : null}
          {packageError ? <p className="status-line error">{packageError}</p> : null}

          {packageResults.length ? (
            <div className="package-results">
              {packageResults.map((pkg) => {
                const alreadyInstalled = isPackageInstalled(pkg.name);

                return (
                  <div className="package-result-item" key={pkg.name}>
                    <div className="package-result-details">
                      <strong>{pkg.name}</strong>
                      <span>{pkg.version}</span>
                    </div>

                    <button
                      type="button"
                      className="add-package-button"
                      disabled={alreadyInstalled || addingPackage === pkg.name}
                      onClick={() => onAddPackage(pkg.name)}
                    >
                      {alreadyInstalled ? "Added" : addingPackage === pkg.name ? "Adding..." : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}
        </>
      ) : null}
    </>
  );
}
