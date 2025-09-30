import {
  FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  api,
  ComplianceIssue,
  CreateComplianceEventPayload,
  Household,
  Program,
  Property,
  Unit
} from "./api";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="section-header">
          <h2 id="modal-title" className="section-title">
            {title}
          </h2>
          <button type="button" className="reset-button" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface DrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

function Drawer({ open, title, onClose, children }: DrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="drawer-overlay" onClick={onClose} role="presentation">
      <aside
        className="drawer-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <button type="button" className="reset-button" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}

function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function App(): JSX.Element {
  const [properties, setProperties] = useState<Property[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [complianceIssues, setComplianceIssues] = useState<ComplianceIssue[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedProgramCategory, setSelectedProgramCategory] = useState("");
  const [selectedVoucherType, setSelectedVoucherType] = useState("");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [activeView, setActiveView] = useState<"dashboard" | "unitTurnBoard">(
    "dashboard"
  );

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [isHouseholdDrawerOpen, setIsHouseholdDrawerOpen] = useState(false);
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);

  const [propertyForm, setPropertyForm] = useState({
    name: "",
    code: "",
    type: "Affordable",
    address_line1: "",
    city: "",
    state: "",
    postal_code: "",
    total_units: "",
    property_manager: ""
  });

  const [programForm, setProgramForm] = useState({
    name: "",
    category: "",
    funding_source: "",
    income_limit_percent: "60",
    rent_limit_percent: ""
  });

  const [householdForm, setHouseholdForm] = useState({
    unit_id: "",
    name: "",
    move_in_date: "",
    annual_income: "",
    household_size: "",
    voucher_type: ""
  });

  const [complianceAction, setComplianceAction] = useState({
    eventType: "File Review",
    notes: "",
    resolvedOn: ""
  });
  const [selectedComplianceIssueIds, setSelectedComplianceIssueIds] = useState<
    number[]
  >([]);

  const resetStatus = useCallback(() => {
    setStatusMessage(null);
    setErrorMessage(null);
  }, []);

  const loadProperties = useCallback(async () => {
    try {
      const data = await api.getProperties();
      setProperties(data);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  }, []);

  const loadPrograms = useCallback(async () => {
    try {
      const data = await api.getPrograms();
      setPrograms(data);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  }, []);

  const loadHouseholds = useCallback(async () => {
    try {
      const data = await api.getHouseholds();
      setHouseholds(data);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  }, []);

  const loadUnits = useCallback(async () => {
    try {
      const data = await api.getUnits();
      setUnits(data);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  }, []);

  const loadComplianceIssues = useCallback(async () => {
    try {
      const data = await api.getComplianceIssues();
      setComplianceIssues(data);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  }, []);

  useEffect(() => {
    loadProperties();
    loadPrograms();
    loadHouseholds();
    loadUnits();
  }, [loadProperties, loadPrograms, loadHouseholds, loadUnits]);

  useEffect(() => {
    if (isComplianceModalOpen) {
      loadComplianceIssues();
    }
  }, [isComplianceModalOpen, loadComplianceIssues]);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch = normalizedSearch
        ? [
            property.name,
            property.code,
            property.city,
            property.state,
            property.property_manager ?? ""
          ].some((value) => value.toLowerCase().includes(normalizedSearch))
        : true;

      const matchesType = selectedPropertyType
        ? property.type === selectedPropertyType
        : true;

      const matchesCity = selectedCity ? property.city === selectedCity : true;
      return matchesSearch && matchesType && matchesCity;
    });
  }, [
    properties,
    normalizedSearch,
    selectedPropertyType,
    selectedCity
  ]);

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const matchesSearch = normalizedSearch
        ? [program.name, program.category, program.funding_source ?? ""]
            .some((value) => value.toLowerCase().includes(normalizedSearch))
        : true;

      const matchesCategory = selectedProgramCategory
        ? program.category === selectedProgramCategory
        : true;

      return matchesSearch && matchesCategory;
    });
  }, [programs, normalizedSearch, selectedProgramCategory]);

  const filteredHouseholds = useMemo(() => {
    return households.filter((household) => {
      const matchesSearch = normalizedSearch
        ? [household.name, household.voucher_type ?? ""]
            .some((value) => value.toLowerCase().includes(normalizedSearch))
        : true;

      const matchesVoucher = selectedVoucherType
        ? (household.voucher_type ?? "") === selectedVoucherType
        : true;

      return matchesSearch && matchesVoucher;
    });
  }, [households, normalizedSearch, selectedVoucherType]);

  const propertyTypes = useMemo(() => {
    return Array.from(new Set(properties.map((property) => property.type)));
  }, [properties]);

  const cities = useMemo(() => {
    return Array.from(new Set(properties.map((property) => property.city)));
  }, [properties]);

  const programCategories = useMemo(() => {
    return Array.from(new Set(programs.map((program) => program.category)));
  }, [programs]);

  const voucherTypes = useMemo(() => {
    return Array.from(
      new Set(households.map((household) => household.voucher_type ?? ""))
    ).filter((voucher) => voucher);
  }, [households]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedPropertyType("");
    setSelectedCity("");
    setSelectedProgramCategory("");
    setSelectedVoucherType("");
    setIsFilterPanelOpen(false);
  };

  const handleExportProperties = () => {
    resetStatus();
    const headers = ["Name", "Code", "Type", "City", "State", "Total Units"];
    const rows = filteredProperties.map((property) => [
      property.name,
      property.code,
      property.type,
      property.city,
      property.state,
      property.total_units?.toString() ?? ""
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "properties.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatusMessage(
      `Exported ${rows.length} properties to CSV based on current filters.`
    );
  };

  const handleNavigateToTurnBoard = () => {
    resetStatus();
    setActiveView("unitTurnBoard");
    setStatusMessage("Showing the Unit Turn Board view.");
  };

  const handleReturnToDashboard = () => {
    resetStatus();
    setActiveView("dashboard");
    setStatusMessage("Returned to portfolio overview.");
  };

  const openComplianceModal = () => {
    resetStatus();
    setSelectedComplianceIssueIds([]);
    setComplianceAction({ eventType: "File Review", notes: "", resolvedOn: "" });
    setIsComplianceModalOpen(true);
  };

  const toggleComplianceIssue = (householdId: number) => {
    setSelectedComplianceIssueIds((current) => {
      return current.includes(householdId)
        ? current.filter((id) => id !== householdId)
        : [...current, householdId];
    });
  };

  const handlePropertySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetStatus();
    try {
      await api.createProperty({
        name: propertyForm.name,
        code: propertyForm.code,
        type: propertyForm.type,
        address_line1: propertyForm.address_line1,
        city: propertyForm.city,
        state: propertyForm.state,
        postal_code: propertyForm.postal_code,
        total_units: propertyForm.total_units
          ? Number(propertyForm.total_units)
          : null,
        property_manager: propertyForm.property_manager || null
      });
      await loadProperties();
      setStatusMessage(`Created property ${propertyForm.name}.`);
      setPropertyForm({
        name: "",
        code: "",
        type: "Affordable",
        address_line1: "",
        city: "",
        state: "",
        postal_code: "",
        total_units: "",
        property_manager: ""
      });
      setIsPropertyModalOpen(false);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  const handleProgramSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetStatus();
    try {
      await api.createProgram({
        name: programForm.name,
        category: programForm.category,
        funding_source: programForm.funding_source || null,
        income_limit_percent: Number(programForm.income_limit_percent),
        rent_limit_percent: programForm.rent_limit_percent
          ? Number(programForm.rent_limit_percent)
          : null
      });
      await loadPrograms();
      setStatusMessage(`Added program ${programForm.name}.`);
      setProgramForm({
        name: "",
        category: "",
        funding_source: "",
        income_limit_percent: "60",
        rent_limit_percent: ""
      });
      setIsProgramModalOpen(false);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  const handleHouseholdSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetStatus();
    try {
      await api.createHousehold({
        unit_id: Number(householdForm.unit_id),
        name: householdForm.name,
        move_in_date: householdForm.move_in_date,
        annual_income: Number(householdForm.annual_income),
        household_size: Number(householdForm.household_size),
        voucher_type: householdForm.voucher_type || null
      });
      await loadHouseholds();
      setStatusMessage(`Onboarded household ${householdForm.name}.`);
      setHouseholdForm({
        unit_id: "",
        name: "",
        move_in_date: "",
        annual_income: "",
        household_size: "",
        voucher_type: ""
      });
      setIsHouseholdDrawerOpen(false);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  const handleComplianceSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetStatus();

    const selectedIssues = complianceIssues.filter((issue) =>
      selectedComplianceIssueIds.includes(issue.household_id)
    );

    if (!selectedIssues.length) {
      setErrorMessage("Select at least one compliance issue to process.");
      return;
    }

    try {
      const payloads: CreateComplianceEventPayload[] = selectedIssues
        .map((issue) => {
          const program = programs.find(
            (candidate) => candidate.name === issue.program_name
          );

          if (!program) {
            return null;
          }

          return {
            household_id: issue.household_id,
            program_id: program.id,
            event_type: complianceAction.eventType,
            finding: issue.issue,
            severity: issue.severity,
            occurred_on: new Date().toISOString().split("T")[0],
            resolved_on: complianceAction.resolvedOn || null,
            notes: complianceAction.notes || null
          } satisfies CreateComplianceEventPayload;
        })
        .filter((payload): payload is CreateComplianceEventPayload => Boolean(payload));

      if (!payloads.length) {
        setErrorMessage("Unable to map selected issues to active programs.");
        return;
      }

      await Promise.all(payloads.map((payload) => api.createComplianceEvent(payload)));
      setStatusMessage(
        `Logged ${payloads.length} compliance event${payloads.length > 1 ? "s" : ""}.`
      );
      setIsComplianceModalOpen(false);
      setSelectedComplianceIssueIds([]);
      setComplianceAction({ eventType: "File Review", notes: "", resolvedOn: "" });
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  const activeUnits = useMemo(() => {
    return units.filter((unit) => unit.status !== "Down");
  }, [units]);

  return (
    <div className="app-shell">
      <header className="page-header">
        <div>
          <h1 className="section-title">RentManager CRM workspace</h1>
          <p>Manage properties, programs, and compliance workflows in one hub.</p>
        </div>
        <div className="primary-actions">
          <button type="button" onClick={() => setIsPropertyModalOpen(true)}>
            New record
          </button>
          <button type="button" onClick={() => setIsProgramModalOpen(true)}>
            Add program
          </button>
          <button type="button" onClick={() => setIsHouseholdDrawerOpen(true)}>
            Add household
          </button>
        </div>
      </header>

      <section className="section">
        <div className="search-controls">
          <input
            type="search"
            placeholder="Search by name, code, or keyword"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button
            type="button"
            className="filter-toggle"
            onClick={() => setIsFilterPanelOpen((open) => !open)}
          >
            {isFilterPanelOpen ? "Hide filters" : "Filter"}
          </button>
          <button type="button" className="reset-button" onClick={clearFilters}>
            Reset
          </button>
        </div>
        {isFilterPanelOpen && (
          <div className="filter-panel">
            <div className="filter-row">
              <label>
                Property type
                <select
                  value={selectedPropertyType}
                  onChange={(event) => setSelectedPropertyType(event.target.value)}
                >
                  <option value="">All</option>
                  {propertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                City
                <select
                  value={selectedCity}
                  onChange={(event) => setSelectedCity(event.target.value)}
                >
                  <option value="">All</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="filter-row">
              <label>
                Program category
                <select
                  value={selectedProgramCategory}
                  onChange={(event) =>
                    setSelectedProgramCategory(event.target.value)
                  }
                >
                  <option value="">All</option>
                  {programCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Voucher type
                <select
                  value={selectedVoucherType}
                  onChange={(event) => setSelectedVoucherType(event.target.value)}
                >
                  <option value="">All</option>
                  {voucherTypes.map((voucher) => (
                    <option key={voucher} value={voucher}>
                      {voucher}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}
        {(statusMessage || errorMessage) && (
          <p className="status-bar">
            {errorMessage ? `⚠️ ${errorMessage}` : `✅ ${statusMessage}`}
          </p>
        )}
      </section>

      {activeView === "unitTurnBoard" && (
        <div className="view-banner">
          <strong>Unit turn board</strong>
          <p>
            Tracking {activeUnits.length} ready and in-progress turns. Use this view
            to coordinate maintenance and leasing readiness.
          </p>
          <button type="button" className="reset-button" onClick={handleReturnToDashboard}>
            Return to dashboard
          </button>
        </div>
      )}

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Property portfolio</h2>
          <div className="secondary-actions">
            <button type="button" onClick={handleExportProperties}>
              Export CSV
            </button>
            <button type="button" onClick={handleNavigateToTurnBoard}>
              Unit turn board
            </button>
            <button type="button" onClick={openComplianceModal}>
              Compliance bulk actions
            </button>
          </div>
        </div>
        {filteredProperties.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Type</th>
                <th>City</th>
                <th>Manager</th>
                <th>Total units</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property) => (
                <tr key={property.id}>
                  <td>{property.name}</td>
                  <td>{property.code}</td>
                  <td>
                    <span className="tag">{property.type}</span>
                  </td>
                  <td>{property.city}</td>
                  <td>{property.property_manager ?? "—"}</td>
                  <td>{property.total_units ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            No properties match the current filters.
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Affordable programs</h2>
          <span>{filteredPrograms.length} programs in scope</span>
        </div>
        {filteredPrograms.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Funding source</th>
                <th>Income limit %</th>
                <th>Rent limit %</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrograms.map((program) => (
                <tr key={program.id}>
                  <td>{program.name}</td>
                  <td>{program.category}</td>
                  <td>{program.funding_source ?? "—"}</td>
                  <td>{program.income_limit_percent}</td>
                  <td>{program.rent_limit_percent ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No programs match the current filters.</div>
        )}
      </section>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Households</h2>
          <span>{filteredHouseholds.length} households</span>
        </div>
        {filteredHouseholds.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Unit</th>
                <th>Move in</th>
                <th>Voucher</th>
                <th>Income</th>
                <th>Household size</th>
              </tr>
            </thead>
            <tbody>
              {filteredHouseholds.map((household) => {
                const unit = units.find((candidate) => candidate.id === household.unit_id);
                return (
                  <tr key={household.id}>
                    <td>{household.name}</td>
                    <td>{unit ? `${unit.number} (${unit.property_id})` : household.unit_id}</td>
                    <td>{household.move_in_date}</td>
                    <td>{household.voucher_type ?? "—"}</td>
                    <td>{formatCurrency(household.annual_income)}</td>
                    <td>{household.household_size}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No households match the current filters.</div>
        )}
      </section>

      <Modal
        open={isPropertyModalOpen}
        title="Create property"
        onClose={() => setIsPropertyModalOpen(false)}
      >
        <form onSubmit={handlePropertySubmit}>
          <label>
            Property name
            <input
              required
              value={propertyForm.name}
              onChange={(event) =>
                setPropertyForm((form) => ({ ...form, name: event.target.value }))
              }
            />
          </label>
          <label>
            Code
            <input
              required
              value={propertyForm.code}
              onChange={(event) =>
                setPropertyForm((form) => ({ ...form, code: event.target.value }))
              }
            />
          </label>
          <label>
            Type
            <input
              value={propertyForm.type}
              onChange={(event) =>
                setPropertyForm((form) => ({ ...form, type: event.target.value }))
              }
            />
          </label>
          <label>
            Address line 1
            <input
              required
              value={propertyForm.address_line1}
              onChange={(event) =>
                setPropertyForm((form) => ({
                  ...form,
                  address_line1: event.target.value
                }))
              }
            />
          </label>
          <label>
            City
            <input
              required
              value={propertyForm.city}
              onChange={(event) =>
                setPropertyForm((form) => ({ ...form, city: event.target.value }))
              }
            />
          </label>
          <label>
            State
            <input
              required
              value={propertyForm.state}
              onChange={(event) =>
                setPropertyForm((form) => ({ ...form, state: event.target.value }))
              }
            />
          </label>
          <label>
            Postal code
            <input
              required
              value={propertyForm.postal_code}
              onChange={(event) =>
                setPropertyForm((form) => ({
                  ...form,
                  postal_code: event.target.value
                }))
              }
            />
          </label>
          <label>
            Total units
            <input
              type="number"
              min={0}
              value={propertyForm.total_units}
              onChange={(event) =>
                setPropertyForm((form) => ({
                  ...form,
                  total_units: event.target.value
                }))
              }
            />
          </label>
          <label>
            Property manager
            <input
              value={propertyForm.property_manager}
              onChange={(event) =>
                setPropertyForm((form) => ({
                  ...form,
                  property_manager: event.target.value
                }))
              }
            />
          </label>
          <div className="modal-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => setIsPropertyModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="primary">
              Save property
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={isProgramModalOpen}
        title="Add affordable program"
        onClose={() => setIsProgramModalOpen(false)}
      >
        <form onSubmit={handleProgramSubmit}>
          <label>
            Program name
            <input
              required
              value={programForm.name}
              onChange={(event) =>
                setProgramForm((form) => ({ ...form, name: event.target.value }))
              }
            />
          </label>
          <label>
            Category
            <input
              required
              value={programForm.category}
              onChange={(event) =>
                setProgramForm((form) => ({ ...form, category: event.target.value }))
              }
            />
          </label>
          <label>
            Funding source
            <input
              value={programForm.funding_source}
              onChange={(event) =>
                setProgramForm((form) => ({
                  ...form,
                  funding_source: event.target.value
                }))
              }
            />
          </label>
          <label>
            Income limit percent
            <input
              type="number"
              min={0}
              max={120}
              required
              value={programForm.income_limit_percent}
              onChange={(event) =>
                setProgramForm((form) => ({
                  ...form,
                  income_limit_percent: event.target.value
                }))
              }
            />
          </label>
          <label>
            Rent limit percent
            <input
              type="number"
              min={0}
              max={120}
              value={programForm.rent_limit_percent}
              onChange={(event) =>
                setProgramForm((form) => ({
                  ...form,
                  rent_limit_percent: event.target.value
                }))
              }
            />
          </label>
          <div className="modal-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => setIsProgramModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="primary">
              Add program
            </button>
          </div>
        </form>
      </Modal>

      <Drawer
        open={isHouseholdDrawerOpen}
        title="Add household"
        onClose={() => setIsHouseholdDrawerOpen(false)}
      >
        <form onSubmit={handleHouseholdSubmit}>
          <label>
            Unit
            <select
              required
              value={householdForm.unit_id}
              onChange={(event) =>
                setHouseholdForm((form) => ({ ...form, unit_id: event.target.value }))
              }
            >
              <option value="">Select unit</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.number} · Property {unit.property_id}
                </option>
              ))}
            </select>
          </label>
          <label>
            Household name
            <input
              required
              value={householdForm.name}
              onChange={(event) =>
                setHouseholdForm((form) => ({ ...form, name: event.target.value }))
              }
            />
          </label>
          <label>
            Move-in date
            <input
              type="date"
              required
              value={householdForm.move_in_date}
              onChange={(event) =>
                setHouseholdForm((form) => ({
                  ...form,
                  move_in_date: event.target.value
                }))
              }
            />
          </label>
          <label>
            Annual income
            <input
              type="number"
              min={0}
              required
              value={householdForm.annual_income}
              onChange={(event) =>
                setHouseholdForm((form) => ({
                  ...form,
                  annual_income: event.target.value
                }))
              }
            />
          </label>
          <label>
            Household size
            <input
              type="number"
              min={1}
              required
              value={householdForm.household_size}
              onChange={(event) =>
                setHouseholdForm((form) => ({
                  ...form,
                  household_size: event.target.value
                }))
              }
            />
          </label>
          <label>
            Voucher type
            <input
              value={householdForm.voucher_type}
              onChange={(event) =>
                setHouseholdForm((form) => ({
                  ...form,
                  voucher_type: event.target.value
                }))
              }
            />
          </label>
          <div className="modal-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => setIsHouseholdDrawerOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="primary">
              Save household
            </button>
          </div>
        </form>
      </Drawer>

      <Modal
        open={isComplianceModalOpen}
        title="Compliance bulk actions"
        onClose={() => setIsComplianceModalOpen(false)}
      >
        <form onSubmit={handleComplianceSubmit}>
          <p>
            Choose the compliance issues you want to process. A follow-up event will
            be logged for each selected household.
          </p>
          <div className="checkbox-grid">
            {complianceIssues.length ? (
              complianceIssues.map((issue) => (
                <label key={issue.household_id}>
                  <input
                    type="checkbox"
                    checked={selectedComplianceIssueIds.includes(issue.household_id)}
                    onChange={() => toggleComplianceIssue(issue.household_id)}
                  />
                  {issue.household_name} · {issue.program_name} – {issue.issue}
                </label>
              ))
            ) : (
              <span>No open compliance issues found.</span>
            )}
          </div>
          <label>
            Event type
            <input
              required
              value={complianceAction.eventType}
              onChange={(event) =>
                setComplianceAction((current) => ({
                  ...current,
                  eventType: event.target.value
                }))
              }
            />
          </label>
          <label>
            Resolution target (optional)
            <input
              type="date"
              value={complianceAction.resolvedOn}
              onChange={(event) =>
                setComplianceAction((current) => ({
                  ...current,
                  resolvedOn: event.target.value
                }))
              }
            />
          </label>
          <label>
            Notes
            <textarea
              rows={3}
              value={complianceAction.notes}
              onChange={(event) =>
                setComplianceAction((current) => ({
                  ...current,
                  notes: event.target.value
                }))
              }
            />
          </label>
          <div className="modal-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => setIsComplianceModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="primary">
              Launch actions
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default App;
