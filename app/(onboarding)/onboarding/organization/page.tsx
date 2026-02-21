'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOnboarding } from '@/contexts/onboarding-context';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { saveOrganization, autoSaveOrganizationData, loadSavedOrganizationData } from '@/app/actions/onboarding';
import { Building2, MapPin, Users, Shield, Mail, FileText, AlertCircle, Info, Globe, Laptop, Server } from 'lucide-react';
import { 
  PRACTICE_TYPES, 
  MEDICAL_SPECIALTIES, 
  OFFICER_ROLES, 
  EHR_SYSTEMS, 
  EMAIL_PROVIDERS, 
  CLOUD_STORAGE_PROVIDERS, 
  VPN_PROVIDERS, 
  DEVICE_TYPES, 
  US_STATES,
  validateUSZIP
} from '@/lib/organization-constants';

export default function OrganizationPage() {
  const { setOrganization, nextStep, markStepComplete } = useOnboarding();
  const router = useRouter();
  
  // Basic organization fields
  const country: 'US' = 'US'; // HIPAA is only for United States
  const [practiceTypePrimary, setPracticeTypePrimary] = useState('medical');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [state, setState] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressZip, setAddressZip] = useState('');
  
  // Officers
  const [securityOfficerRole, setSecurityOfficerRole] = useState('hipaa-security-officer');
  const [securityOfficerRoleOther, setSecurityOfficerRoleOther] = useState('');
  const [privacyOfficerRole, setPrivacyOfficerRole] = useState('hipaa-privacy-officer');
  const [privacyOfficerRoleOther, setPrivacyOfficerRoleOther] = useState('');
  
  // Organization structure
  const [employeeCount, setEmployeeCount] = useState(5);
  const [numberOfLocations, setNumberOfLocations] = useState(1);
  const [multiStateOperations, setMultiStateOperations] = useState(false);
  const [remoteWorkforce, setRemoteWorkforce] = useState(false);
  
  // Technology
  const [ehrSystem, setEhrSystem] = useState('not-applicable');
  const [emailProvider, setEmailProvider] = useState('not-specified');
  const [cloudStorageProvider, setCloudStorageProvider] = useState('not-using-cloud');
  const [usesVpn, setUsesVpn] = useState(false);
  const [vpnProvider, setVpnProvider] = useState('not-specified');
  const [deviceTypes, setDeviceTypes] = useState<string[]>([]);
  
  // Conditional fields
  const [performsLaboratoryTests, setPerformsLaboratoryTests] = useState(false);
  const [servesMedicarePatients, setServesMedicarePatients] = useState(false);
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    legal_name: '',
    dba: '',
    address_street: '',
    address_city: '',
    security_officer_name: '',
    security_officer_email: '',
    privacy_officer_name: '',
    privacy_officer_email: '',
    has_employees: true,
    uses_contractors: false,
    stores_phi_electronically: true,
    // US HIPAA Required Fields
    ein: '',
    npi: '',
    state_license_number: '',
    state_tax_id: '',
    ceo_name: '',
    ceo_title: '',
    authorized_representative_name: '',
    authorized_representative_title: '',
    // Conditional Fields
    clia_certificate_number: '',
    medicare_provider_number: '',
    // Optional but Recommended
    phone_number: '',
    email_address: '',
    website: '',
    accreditation_status: '',
    types_of_services: '',
    insurance_coverage: '',
    // Contact information
    primary_contact_name: '',
    compliance_contact_email: '',
    compliance_contact_phone: ''
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isSavingRef = useRef(false); // Internal flag to prevent concurrent saves
  const [isSubmitting, setIsSubmitting] = useState(false); // For final submit only

  // Helper function to get all form data as a single object (memoized)
  const getAllFormData = useCallback(() => ({
    ...formData,
    type: practiceTypePrimary as any,
    country,
    practice_type_primary: practiceTypePrimary,
    specialties,
    state,
    address_state: addressState,
    address_zip: addressZip,
    security_officer_role: securityOfficerRole === 'other' ? securityOfficerRoleOther : securityOfficerRole,
    security_officer_role_other: securityOfficerRoleOther,
    privacy_officer_role: privacyOfficerRole === 'other' ? privacyOfficerRoleOther : privacyOfficerRole,
    privacy_officer_role_other: privacyOfficerRoleOther,
    employeeCount,
    number_of_locations: numberOfLocations,
    multi_state_operations: multiStateOperations,
    remote_workforce: remoteWorkforce,
    ehr_system: ehrSystem === 'not-applicable' ? undefined : ehrSystem,
    email_provider: emailProvider === 'not-specified' ? undefined : emailProvider,
    uses_cloud_services: cloudStorageProvider !== 'not-using-cloud',
    cloud_storage_provider: cloudStorageProvider === 'not-using-cloud' ? undefined : cloudStorageProvider,
    uses_vpn: usesVpn,
    vpn_provider: vpnProvider === 'not-specified' ? undefined : vpnProvider,
    device_types: deviceTypes,
    performs_laboratory_tests: performsLaboratoryTests,
    serves_medicare_patients: servesMedicarePatients
  }), [formData, practiceTypePrimary, country, specialties, state, addressState, addressZip, securityOfficerRole, securityOfficerRoleOther, privacyOfficerRole, privacyOfficerRoleOther, employeeCount, numberOfLocations, multiStateOperations, remoteWorkforce, ehrSystem, emailProvider, cloudStorageProvider, usesVpn, vpnProvider, deviceTypes, performsLaboratoryTests, servesMedicarePatients]);

  // Save to localStorage as backup
  const saveToLocalStorage = (data: any) => {
    try {
      localStorage.setItem('hipaa_org_form_draft', JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  };

  // Load from localStorage as backup
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('hipaa_org_form_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only use if saved within last 7 days
        const savedDate = new Date(parsed.timestamp);
        const daysDiff = (Date.now() - savedDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff < 7) {
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
    }
    return null;
  };

  // Load saved data on mount (from Supabase first, then localStorage as fallback)
  useEffect(() => {
    const loadSaved = async () => {
      // Try Supabase first
      const saved = await loadSavedOrganizationData();
      if (saved) {
        setFormData(prev => ({ ...prev, ...saved }));
        // Country is always US for HIPAA
        if (saved.practice_type_primary || saved.type) {
          setPracticeTypePrimary(saved.practice_type_primary || saved.type || 'medical');
        }
        if (saved.specialties) setSpecialties(saved.specialties || []);
        if (saved.state) setState(saved.state);
        if (saved.address_state) setAddressState(saved.address_state);
        if (saved.address_zip) setAddressZip(saved.address_zip);
        if (saved.security_officer_role) {
          setSecurityOfficerRole(saved.security_officer_role || 'hipaa-security-officer');
        }
        if (saved.security_officer_role_other) setSecurityOfficerRoleOther(saved.security_officer_role_other);
        if (saved.privacy_officer_role) {
          setPrivacyOfficerRole(saved.privacy_officer_role || 'hipaa-privacy-officer');
        }
        if (saved.privacy_officer_role_other) setPrivacyOfficerRoleOther(saved.privacy_officer_role_other);
        if (saved.employeeCount) setEmployeeCount(saved.employeeCount);
        if (saved.number_of_locations) setNumberOfLocations(saved.number_of_locations);
        if (saved.multi_state_operations) setMultiStateOperations(saved.multi_state_operations);
        if (saved.remote_workforce) setRemoteWorkforce(saved.remote_workforce);
        if (saved.ehr_system) setEhrSystem(saved.ehr_system || 'not-applicable');
        if (saved.email_provider) setEmailProvider(saved.email_provider || 'not-specified');
        if (saved.cloud_storage_provider) setCloudStorageProvider(saved.cloud_storage_provider || 'not-using-cloud');
        if (saved.uses_vpn) setUsesVpn(saved.uses_vpn);
        if (saved.vpn_provider) setVpnProvider(saved.vpn_provider || 'not-specified');
        if (saved.device_types) setDeviceTypes(saved.device_types || []);
        if (saved.performs_laboratory_tests) setPerformsLaboratoryTests(saved.performs_laboratory_tests);
        if (saved.serves_medicare_patients) setServesMedicarePatients(saved.serves_medicare_patients);
      } else {
        // Fallback to localStorage if Supabase has no data
        const localData = loadFromLocalStorage();
        if (localData) {
          setFormData(prev => ({ ...prev, ...localData }));
          if (localData.practice_type_primary || localData.type) {
            setPracticeTypePrimary(localData.practice_type_primary || localData.type || 'medical');
          }
          if (localData.specialties) setSpecialties(localData.specialties || []);
          if (localData.state) setState(localData.state);
          if (localData.address_state) setAddressState(localData.address_state);
          if (localData.address_zip) setAddressZip(localData.address_zip);
          if (localData.security_officer_role) setSecurityOfficerRole(localData.security_officer_role || 'hipaa-security-officer');
          if (localData.security_officer_role_other) setSecurityOfficerRoleOther(localData.security_officer_role_other);
          if (localData.privacy_officer_role) setPrivacyOfficerRole(localData.privacy_officer_role || 'hipaa-privacy-officer');
          if (localData.privacy_officer_role_other) setPrivacyOfficerRoleOther(localData.privacy_officer_role_other);
          if (localData.employeeCount) setEmployeeCount(localData.employeeCount);
          if (localData.number_of_locations) setNumberOfLocations(localData.number_of_locations);
          if (localData.multi_state_operations !== undefined) setMultiStateOperations(localData.multi_state_operations);
          if (localData.remote_workforce !== undefined) setRemoteWorkforce(localData.remote_workforce);
          if (localData.ehr_system) setEhrSystem(localData.ehr_system || 'not-applicable');
          if (localData.email_provider) setEmailProvider(localData.email_provider || 'not-specified');
          if (localData.cloud_storage_provider) setCloudStorageProvider(localData.cloud_storage_provider || 'not-using-cloud');
          if (localData.uses_vpn !== undefined) setUsesVpn(localData.uses_vpn);
          if (localData.vpn_provider) setVpnProvider(localData.vpn_provider || 'not-specified');
          if (localData.device_types) setDeviceTypes(localData.device_types || []);
          if (localData.performs_laboratory_tests !== undefined) setPerformsLaboratoryTests(localData.performs_laboratory_tests);
          if (localData.serves_medicare_patients !== undefined) setServesMedicarePatients(localData.serves_medicare_patients);
        }
      }
    };
    loadSaved();
  }, []);

  // Auto-save function (called by debounce and beforeunload) - silent, no UI feedback
  const performAutoSave = useCallback(async () => {
    if (isSavingRef.current) return; // Prevent concurrent saves
    
    isSavingRef.current = true;
    setHasUnsavedChanges(false);
    
    const allData = getAllFormData();
    
    try {
      // Save to localStorage immediately (fast, reliable)
      saveToLocalStorage(allData);
      
      // Save to Supabase (may take longer) - silently in background
      const result = await autoSaveOrganizationData(allData);
      
      if (result.success) {
        // Clear localStorage after successful Supabase save
        localStorage.removeItem('hipaa_org_form_draft');
      } else {
        console.warn('Auto-save to Supabase failed, but data saved to localStorage:', result.error);
      }
    } catch (error) {
      console.error('Failed to auto-save organization data:', error);
      // Data is still in localStorage, so it's safe
    } finally {
      isSavingRef.current = false;
    }
  }, [getAllFormData]);

  // Auto-save with debounce - Save ALL data as user types
  useEffect(() => {
    setHasUnsavedChanges(true);
    
    const timeoutId = setTimeout(() => {
      performAutoSave();
    }, 500); // Reduced to 500ms for faster saves

    return () => clearTimeout(timeoutId);
  }, [formData, country, practiceTypePrimary, specialties, state, addressState, addressZip, securityOfficerRole, securityOfficerRoleOther, privacyOfficerRole, privacyOfficerRoleOther, employeeCount, numberOfLocations, multiStateOperations, remoteWorkforce, ehrSystem, emailProvider, cloudStorageProvider, usesVpn, vpnProvider, deviceTypes, performsLaboratoryTests, servesMedicarePatients, performAutoSave]);

  // Use ref to track form data for beforeunload (avoids dependency issues)
  const formDataRef = useRef(getAllFormData());
  useEffect(() => {
    formDataRef.current = getAllFormData();
  });

  // Save before page unload (critical for data persistence)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasUnsavedChanges) {
        // Perform synchronous save to localStorage
        const allData = formDataRef.current;
        saveToLocalStorage(allData);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.legal_name || !practiceTypePrimary || !state ||
        !formData.address_street || !formData.address_city || !addressState || !addressZip ||
        !formData.security_officer_name || !formData.security_officer_email || !securityOfficerRole ||
        !formData.privacy_officer_name || !formData.privacy_officer_email || !privacyOfficerRole) {
      return;
    }

    // Validate ZIP for US
    if (country === 'US' && addressZip && !validateUSZIP(addressZip)) {
      setValidationErrors({ address_zip: 'Invalid US ZIP format. Must be 5 digits or 9 digits (XXXXX or XXXXX-XXXX)' });
      return;
    }

    if (isSubmitting) return; // Prevent multiple submits
    setIsSubmitting(true);

    try {
      // Save to database - convert to format expected by saveOrganization
      await saveOrganization({
        name: formData.name,
        legal_name: formData.legal_name,
        dba: formData.dba || undefined,
        type: practiceTypePrimary as any,
        state: state,
        address_street: formData.address_street,
        address_city: formData.address_city,
        address_state: addressState,
        address_zip: addressZip,
        security_officer_name: formData.security_officer_name,
        security_officer_email: formData.security_officer_email,
        security_officer_role: securityOfficerRole,
        privacy_officer_name: formData.privacy_officer_name,
        privacy_officer_email: formData.privacy_officer_email,
        privacy_officer_role: privacyOfficerRole,
        employeeCount: employeeCount,
        has_employees: formData.has_employees,
        uses_contractors: formData.uses_contractors,
        stores_phi_electronically: formData.stores_phi_electronically,
        uses_cloud_services: cloudStorageProvider !== 'not-using-cloud',
        // US HIPAA Required Fields
        ein: formData.ein || undefined,
        npi: formData.npi || undefined,
        state_license_number: formData.state_license_number || undefined,
        state_tax_id: formData.state_tax_id || undefined,
        ceo_name: formData.ceo_name || undefined,
        ceo_title: formData.ceo_title || undefined,
        authorized_representative_name: formData.authorized_representative_name || undefined,
        authorized_representative_title: formData.authorized_representative_title || undefined,
        // Conditional Fields
        performs_laboratory_tests: performsLaboratoryTests,
        clia_certificate_number: formData.clia_certificate_number || undefined,
        serves_medicare_patients: servesMedicarePatients,
        medicare_provider_number: formData.medicare_provider_number || undefined,
        // Optional but Recommended
        phone_number: formData.phone_number || undefined,
        email_address: formData.email_address || undefined,
        website: formData.website || undefined,
        accreditation_status: formData.accreditation_status || undefined,
        types_of_services: formData.types_of_services || undefined,
        insurance_coverage: formData.insurance_coverage || undefined,
        // Additional metadata fields
        practice_type_primary: practiceTypePrimary,
        specialties: specialties.length > 0 ? specialties : undefined,
        number_of_locations: numberOfLocations,
        multi_state_operations: multiStateOperations,
        remote_workforce: remoteWorkforce,
        ehr_system: ehrSystem === 'not-applicable' ? undefined : ehrSystem,
        email_provider: emailProvider === 'not-specified' ? undefined : emailProvider,
        cloud_storage_provider: cloudStorageProvider === 'not-using-cloud' ? undefined : cloudStorageProvider,
        uses_vpn: usesVpn,
        vpn_provider: vpnProvider === 'not-specified' ? undefined : vpnProvider,
        device_types: deviceTypes.length > 0 ? deviceTypes : undefined,
        security_officer_role_other: securityOfficerRole === 'other' ? securityOfficerRoleOther : undefined,
        privacy_officer_role_other: privacyOfficerRole === 'other' ? privacyOfficerRoleOther : undefined,
        primary_contact_name: formData.primary_contact_name || undefined,
        compliance_contact_email: formData.compliance_contact_email || undefined,
        compliance_contact_phone: formData.compliance_contact_phone || undefined
      });

      // Update context
      setOrganization({
        name: formData.name,
        type: practiceTypePrimary as any,
        state: state,
        employeeCount: employeeCount
      });

      markStepComplete(2);
      nextStep();
      router.push('/onboarding/risk-assessment-intro');
    } catch (error) {
      console.error('Error saving organization:', error);
      alert('Failed to save organization. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = 
    formData.name && 
    formData.legal_name && 
    practiceTypePrimary && 
    state &&
    formData.address_street &&
    formData.address_city &&
    addressState &&
    addressZip &&
    formData.security_officer_name &&
    formData.security_officer_email &&
    securityOfficerRole &&
    formData.privacy_officer_name &&
    formData.privacy_officer_email &&
    privacyOfficerRole &&
    Object.keys(validationErrors).length === 0;

  const handleBack = () => {
    router.push('/onboarding');
  };

  return (
    <OnboardingLayout
      onNext={handleSubmit}
      onBack={handleBack}
      nextButtonLabel="Continue to Risk Assessment"
      showNextButton={true}
      nextButtonDisabled={!isFormValid || isSubmitting}
    >
      <div className="space-y-6 max-w-[1600px] mx-auto w-full">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-thin text-[#0e274e]">
            Tell us about your practice
          </h1>
          <p className="text-[#565656] font-light">
            This information is required for HIPAA compliance documentation
          </p>
        </div>

        {/* Organization Identity */}
        <Card className="card-premium-enter stagger-item border-0 shadow-sm rounded-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#00bceb]" />
              <CardTitle className="text-xl font-light text-[#0e274e]">
                Organization Identity
              </CardTitle>
            </div>
            <CardDescription className="text-[#565656] font-light">
              Legal information about your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country" className="text-[#0e274e] font-light">
                  Country / Jurisdiction <span className="text-red-500">*</span>
                </Label>
                <Select
                  value="US"
                  disabled
                  required
                >
                  <SelectTrigger className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] bg-gray-50 rounded-none font-light">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="US" className="font-light">United States (US)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#565656] font-light">HIPAA compliance is only applicable to United States organizations.</p>
                {validationErrors.country && (
                  <p className="text-sm text-red-500 font-light">{validationErrors.country}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="legal_name" className="text-[#0e274e] font-light">
                  Legal Organization Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="legal_name"
                  placeholder="Enter legal organization name"
                  value={formData.legal_name}
                  onChange={(e) =>
                    setFormData({ ...formData, legal_name: e.target.value })
                  }
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#0e274e] font-light">
                  Clinic Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Downtown Medical Clinic"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dba" className="text-[#0e274e] font-light">
                  DBA (Doing Business As)
                </Label>
                <Input
                  id="dba"
                  placeholder="Optional"
                  value={formData.dba}
                  onChange={(e) =>
                    setFormData({ ...formData, dba: e.target.value })
                  }
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="practice_type_primary" className="text-[#0e274e] font-light">
                  Practice Type (Primary) <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={practiceTypePrimary}
                  onValueChange={setPracticeTypePrimary}
                  required
                >
                  <SelectTrigger className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light">
                    <SelectValue placeholder="Select practice type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    {PRACTICE_TYPES.map((pt) => (
                      <SelectItem key={pt.value} value={pt.value} className="font-light">
                        {pt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {country === 'US' && (
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-[#0e274e] font-light">
                    State (US) <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={state}
                    onValueChange={(value) => {
                      setState(value);
                      if (!addressState) {
                        setAddressState(value);
                      }
                      setValidationErrors({});
                    }}
                    required
                  >
                    <SelectTrigger className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      {US_STATES.map((stateOption) => (
                        <SelectItem key={stateOption} value={stateOption} className="font-light">
                          {stateOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            {/* Specialties (Multiple) */}
            <div className="space-y-2">
              <Label className="text-[#0e274e] font-light">
                Medical Specialties (Select all that apply)
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 border border-gray-200 rounded-none max-h-64 overflow-y-auto">
                {MEDICAL_SPECIALTIES.map((specialty) => (
                  <div key={specialty} className="flex items-center space-x-2">
                    <Checkbox
                      id={`specialty-${specialty}`}
                      checked={specialties.includes(specialty)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSpecialties([...specialties, specialty]);
                        } else {
                          setSpecialties(specialties.filter(s => s !== specialty));
                        }
                      }}
                      className="rounded-none border-gray-400 data-[state=checked]:bg-[#00bceb] data-[state=checked]:border-[#00bceb]"
                    />
                    <Label
                      htmlFor={`specialty-${specialty}`}
                      className="text-sm font-light cursor-pointer text-[#565656]"
                    >
                      {specialty}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Primary Business Address */}
        <Card className="card-premium-enter stagger-item border-0 shadow-sm rounded-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#00bceb]" />
              <CardTitle className="text-xl font-light text-[#0e274e]">
                Primary Business Address
              </CardTitle>
            </div>
            <CardDescription className="text-[#565656] font-light">
              Juridically critical for contracts and breach notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address_street" className="text-[#0e274e] font-light">
                Street Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address_street"
                placeholder="Enter street address"
                value={formData.address_street}
                onChange={(e) =>
                  setFormData({ ...formData, address_street: e.target.value })
                }
                className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address_city" className="text-[#0e274e] font-light">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address_city"
                  placeholder="Enter city"
                  value={formData.address_city}
                  onChange={(e) =>
                    setFormData({ ...formData, address_city: e.target.value })
                  }
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_state" className="text-[#0e274e] font-light">
                  State <span className="text-red-500">*</span>
                </Label>
                {country === 'US' ? (
                  <Select
                    value={addressState}
                    onValueChange={(value) => {
                      setAddressState(value);
                      setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.address_state;
                        return newErrors;
                      });
                    }}
                    required
                  >
                    <SelectTrigger className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      {US_STATES.map((stateOption) => (
                        <SelectItem key={stateOption} value={stateOption} className="font-light">
                          {stateOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="address_state"
                    value={addressState}
                    onChange={(e) => setAddressState(e.target.value)}
                    placeholder="Enter state/province"
                    className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                    required
                  />
                )}
                {validationErrors.address_state && (
                  <p className="text-sm text-red-500 font-light">{validationErrors.address_state}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_zip" className="text-[#0e274e] font-light">
                  ZIP Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address_zip"
                  value={addressZip}
                  onChange={(e) => {
                    const value = e.target.value;
                    setAddressZip(value);
                    // Validate ZIP format for US
                    if (country === 'US' && value && !validateUSZIP(value)) {
                      setValidationErrors(prev => ({
                        ...prev,
                        address_zip: 'Invalid US ZIP format. Must be 5 digits or 9 digits (XXXXX or XXXXX-XXXX)'
                      }));
                    } else {
                      setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.address_zip;
                        return newErrors;
                      });
                    }
                  }}
                  placeholder={country === 'US' ? '12345 or 12345-6789' : 'Enter ZIP/Postal Code'}
                  className={`border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light ${
                    validationErrors.address_zip ? 'border-red-500' : ''
                  }`}
                  required
                />
                {validationErrors.address_zip && (
                  <p className="text-sm text-red-500 font-light">{validationErrors.address_zip}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Officer */}
        <Card className="card-premium-enter stagger-item border-0 shadow-sm rounded-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#00bceb]" />
              <CardTitle className="text-xl font-light text-[#0e274e]">
                Security Officer
              </CardTitle>
            </div>
            <CardDescription className="text-[#565656] font-light">
              HIPAA requires names, not generic titles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="security_officer_name" className="text-[#0e274e] font-light">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="security_officer_name"
                  placeholder="Enter full name"
                  value={formData.security_officer_name}
                  onChange={(e) =>
                    setFormData({ ...formData, security_officer_name: e.target.value })
                  }
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="security_officer_email" className="text-[#0e274e] font-light">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="security_officer_email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.security_officer_email}
                  onChange={(e) =>
                    setFormData({ ...formData, security_officer_email: e.target.value })
                  }
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="security_officer_role" className="text-[#0e274e] font-light">
                  Role / Title <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={securityOfficerRole}
                  onValueChange={setSecurityOfficerRole}
                  required
                >
                  <SelectTrigger className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    {OFFICER_ROLES.security.map((role) => (
                      <SelectItem key={role.value} value={role.value} className="font-light">
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {securityOfficerRole === 'other' && (
                  <Input
                    placeholder="Specify role"
                    value={securityOfficerRoleOther}
                    onChange={(e) => setSecurityOfficerRoleOther(e.target.value)}
                    className="mt-2 border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Officer */}
        <Card className="card-premium-enter stagger-item border-0 shadow-sm rounded-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#00bceb]" />
              <CardTitle className="text-xl font-light text-[#0e274e]">
                Privacy Officer
              </CardTitle>
            </div>
            <CardDescription className="text-[#565656] font-light">
              Can be the same person as Security Officer, but name must exist
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="privacy_officer_name" className="text-[#0e274e] font-light">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="privacy_officer_name"
                  placeholder="Enter full name"
                  value={formData.privacy_officer_name}
                  onChange={(e) =>
                    setFormData({ ...formData, privacy_officer_name: e.target.value })
                  }
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="privacy_officer_email" className="text-[#0e274e] font-light">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="privacy_officer_email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.privacy_officer_email}
                  onChange={(e) =>
                    setFormData({ ...formData, privacy_officer_email: e.target.value })
                  }
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="privacy_officer_role" className="text-[#0e274e] font-light">
                  Role / Title <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={privacyOfficerRole}
                  onValueChange={setPrivacyOfficerRole}
                  required
                >
                  <SelectTrigger className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    {OFFICER_ROLES.privacy.map((role) => (
                      <SelectItem key={role.value} value={role.value} className="font-light">
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {privacyOfficerRole === 'other' && (
                  <Input
                    placeholder="Specify role"
                    value={privacyOfficerRoleOther}
                    onChange={(e) => setPrivacyOfficerRoleOther(e.target.value)}
                    className="mt-2 border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Structure */}
        <Card className="card-premium-enter stagger-item border-0 shadow-sm rounded-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#00bceb]" />
              <CardTitle className="text-xl font-light text-[#0e274e]">
                Organization Structure
              </CardTitle>
            </div>
            <CardDescription className="text-[#565656] font-light">
              Information about your workforce
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="employee_count" className="text-[#0e274e] font-light">
                    Number of Employees
                  </Label>
                  <p className="text-sm text-[#565656] font-light">
                    Current: {employeeCount} {employeeCount === 1 ? 'employee' : 'employees'}
                  </p>
                </div>
              </div>
              <Slider
                id="employee_count"
                min={1}
                max={100}
                step={1}
                value={[employeeCount]}
                onValueChange={(value) => setEmployeeCount(value[0])}
                className="w-full"
              />
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="has_employees" className="text-[#0e274e] font-light">
                    Do you have employees?
                  </Label>
                  <p className="text-sm text-[#565656] font-light">
                    Select if your organization has employees
                  </p>
                </div>
                <Switch
                  id="has_employees"
                  checked={formData.has_employees}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, has_employees: checked })
                  }
                  className="data-[state=checked]:bg-[#00bceb]"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="uses_contractors" className="text-[#0e274e] font-light">
                    Uses Contractors / Vendors with PHI?
                  </Label>
                  <p className="text-sm text-[#565656] font-light">
                    Select if you work with contractors or vendors who handle PHI
                  </p>
                </div>
                <Switch
                  id="uses_contractors"
                  checked={formData.uses_contractors}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, uses_contractors: checked })
                  }
                  className="data-[state=checked]:bg-[#00bceb]"
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="number_of_locations" className="text-[#0e274e] font-light">
                  Number of Locations
                </Label>
                <Input
                  id="number_of_locations"
                  type="number"
                  min="1"
                  value={numberOfLocations}
                  onChange={(e) => setNumberOfLocations(parseInt(e.target.value) || 1)}
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="multi_state_operations" className="text-[#0e274e] font-light">
                    Multi-State Operations
                  </Label>
                  <p className="text-sm text-[#565656] font-light">
                    Does your organization operate in multiple states?
                  </p>
                </div>
                <Switch
                  id="multi_state_operations"
                  checked={multiStateOperations}
                  onCheckedChange={setMultiStateOperations}
                  className="data-[state=checked]:bg-[#00bceb]"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="remote_workforce" className="text-[#0e274e] font-light">
                    Remote Workforce
                  </Label>
                  <p className="text-sm text-[#565656] font-light">
                    Does your organization have remote workforce members?
                  </p>
                </div>
                <Switch
                  id="remote_workforce"
                  checked={remoteWorkforce}
                  onCheckedChange={setRemoteWorkforce}
                  className="data-[state=checked]:bg-[#00bceb]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology Infrastructure */}
        <Card className="card-premium-enter stagger-item border-0 shadow-sm rounded-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Laptop className="h-5 w-5 text-[#00bceb]" />
              <CardTitle className="text-xl font-light text-[#0e274e]">
                Technology Infrastructure
              </CardTitle>
            </div>
            <CardDescription className="text-[#565656] font-light">
              Detailed information about your technology systems (impacts Security Policy)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="stores_phi_electronically" className="text-[#0e274e] font-light">
                  Do you store or process PHI electronically?
                </Label>
                <p className="text-sm text-[#565656] font-light">
                  Almost always Yes for modern practices
                </p>
              </div>
              <Switch
                id="stores_phi_electronically"
                checked={formData.stores_phi_electronically}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, stores_phi_electronically: checked })
                }
                className="data-[state=checked]:bg-[#00bceb]"
              />
            </div>
            
            <Separator />
            
            {/* EHR System */}
            <div className="space-y-2">
              <Label htmlFor="ehr_system" className="text-[#0e274e] font-light">
                EHR System (Electronic Health Records)
              </Label>
              <Select value={ehrSystem} onValueChange={setEhrSystem}>
                <SelectTrigger className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light">
                  <SelectValue placeholder="Select EHR system (if applicable)" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="not-applicable" className="font-light">Not Applicable</SelectItem>
                  {EHR_SYSTEMS.map((ehr) => (
                    <SelectItem key={ehr} value={ehr} className="font-light">
                      {ehr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Email Provider */}
            <div className="space-y-2">
              <Label htmlFor="email_provider" className="text-[#0e274e] font-light">
                Email Provider
              </Label>
              <Select value={emailProvider} onValueChange={setEmailProvider}>
                <SelectTrigger className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light">
                  <SelectValue placeholder="Select email provider" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="not-specified" className="font-light">Not Specified</SelectItem>
                  {EMAIL_PROVIDERS.map((provider) => (
                    <SelectItem key={provider} value={provider} className="font-light">
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Cloud Storage Provider */}
            <div className="space-y-2">
              <Label htmlFor="cloud_storage_provider" className="text-[#0e274e] font-light">
                Cloud Storage Provider
              </Label>
              <Select value={cloudStorageProvider} onValueChange={setCloudStorageProvider}>
                <SelectTrigger className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light">
                  <SelectValue placeholder="Select cloud storage provider (if applicable)" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="not-using-cloud" className="font-light">Not Using Cloud Storage</SelectItem>
                  {CLOUD_STORAGE_PROVIDERS.map((provider) => (
                    <SelectItem key={provider} value={provider} className="font-light">
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* VPN */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="uses_vpn" className="text-[#0e274e] font-light">
                    Uses VPN for Remote Access?
                  </Label>
                  <p className="text-sm text-[#565656] font-light">
                    Virtual Private Network for secure remote access
                  </p>
                </div>
                <Switch
                  id="uses_vpn"
                  checked={usesVpn}
                  onCheckedChange={setUsesVpn}
                  className="data-[state=checked]:bg-[#00bceb]"
                />
              </div>
              {usesVpn && (
                <div className="space-y-2">
                  <Label htmlFor="vpn_provider" className="text-[#0e274e] font-light">
                    VPN Provider
                  </Label>
                  <Select value={vpnProvider} onValueChange={setVpnProvider}>
                    <SelectTrigger className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light">
                      <SelectValue placeholder="Select VPN provider" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      <SelectItem value="not-specified" className="font-light">Not Specified</SelectItem>
                      {VPN_PROVIDERS.map((provider) => (
                        <SelectItem key={provider} value={provider} className="font-light">
                          {provider}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            {/* Device Types */}
            <div className="space-y-2">
              <Label className="text-[#0e274e] font-light">
                Device Types Used (Select all that apply)
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-gray-200 rounded-none">
                {DEVICE_TYPES.map((device) => (
                  <div key={device} className="flex items-center space-x-2">
                    <Checkbox
                      id={`device-${device}`}
                      checked={deviceTypes.includes(device)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setDeviceTypes([...deviceTypes, device]);
                        } else {
                          setDeviceTypes(deviceTypes.filter(d => d !== device));
                        }
                      }}
                      className="rounded-none border-gray-400 data-[state=checked]:bg-[#00bceb] data-[state=checked]:border-[#00bceb]"
                    />
                    <Label
                      htmlFor={`device-${device}`}
                      className="text-sm font-light cursor-pointer text-[#565656]"
                    >
                      {device}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optional Contact Information */}
        <Card className="card-premium-enter stagger-item border-0 shadow-sm rounded-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#00bceb]" />
              <CardTitle className="text-xl font-light text-[#0e274e]">
                Contact Information
              </CardTitle>
            </div>
            <CardDescription className="text-[#565656] font-light">
              Optional institutional contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_contact_name" className="text-[#0e274e] font-light">
                  Primary Contact Name
                </Label>
                <Input
                  id="primary_contact_name"
                  placeholder="Optional"
                  value={formData.primary_contact_name}
                  onChange={(e) =>
                    setFormData({ ...formData, primary_contact_name: e.target.value })
                  }
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compliance_contact_email" className="text-[#0e274e] font-light">
                  Compliance Contact Email
                </Label>
                <Input
                  id="compliance_contact_email"
                  type="email"
                  placeholder="Optional"
                  value={formData.compliance_contact_email}
                  onChange={(e) =>
                    setFormData({ ...formData, compliance_contact_email: e.target.value })
                  }
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compliance_contact_phone" className="text-[#0e274e] font-light">
                  Compliance Contact Phone
                </Label>
                <Input
                  id="compliance_contact_phone"
                  type="tel"
                  placeholder="Optional"
                  value={formData.compliance_contact_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, compliance_contact_phone: e.target.value })
                  }
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* US HIPAA Required Legal Identifiers */}
        <Card className="card-premium-enter stagger-item border-l-4 border-[#00bceb] bg-white rounded-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#00bceb]" />
              <CardTitle className="text-xl font-light text-[#0e274e]">
                US Legal Identifiers (Required)
              </CardTitle>
            </div>
            <CardDescription className="text-[#565656] font-light">
              Mandatory identifiers for HIPAA compliance documents in the United States
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ein" className="text-[#0e274e] font-light">
                  EIN (Employer Identification Number) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ein"
                  placeholder="XX-XXXXXXX"
                  value={formData.ein}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 2) {
                      value = value.slice(0, 2) + '-' + value.slice(2, 9);
                    }
                    setFormData({ ...formData, ein: value });
                  }}
                  maxLength={10}
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                  required
                />
                <p className="text-xs text-[#565656] font-light">Format: XX-XXXXXXX (9 digits)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="npi" className="text-[#0e274e] font-light">
                  NPI (National Provider Identifier) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="npi"
                  placeholder="1234567890"
                  value={formData.npi}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, npi: value });
                  }}
                  maxLength={10}
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                  required
                />
                <p className="text-xs text-[#565656] font-light">10 digits</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state_license_number" className="text-[#0e274e] font-light">
                  State License Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state_license_number"
                  placeholder="Enter state license number"
                  value={formData.state_license_number}
                  onChange={(e) =>
                    setFormData({ ...formData, state_license_number: e.target.value })
                  }
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state_tax_id" className="text-[#0e274e] font-light">
                  State Tax ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state_tax_id"
                  placeholder="Enter state tax ID"
                  value={formData.state_tax_id}
                  onChange={(e) =>
                    setFormData({ ...formData, state_tax_id: e.target.value })
                  }
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CEO / Authorized Representative */}
        <Card className="card-premium-enter stagger-item border-0 shadow-sm rounded-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#00bceb]" />
              <CardTitle className="text-xl font-light text-[#0e274e]">
                CEO / Authorized Representative
              </CardTitle>
            </div>
            <CardDescription className="text-[#565656] font-light">
              Person authorized to sign legal documents and approve policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ceo_name" className="text-[#0e274e] font-light">
                  CEO / Authorized Representative Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ceo_name"
                  placeholder="Enter full name"
                  value={formData.ceo_name}
                  onChange={(e) =>
                    setFormData({ ...formData, ceo_name: e.target.value })
                  }
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ceo_title" className="text-[#0e274e] font-light">
                  CEO / Authorized Representative Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ceo_title"
                  placeholder="e.g., Chief Executive Officer, President"
                  value={formData.ceo_title}
                  onChange={(e) =>
                    setFormData({ ...formData, ceo_title: e.target.value })
                  }
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conditional Requirements */}
        <Card className="card-premium-enter stagger-item border-l-4 border-amber-400 bg-white rounded-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-xl font-light text-[#0e274e]">
                Conditional Requirements
              </CardTitle>
            </div>
            <CardDescription className="text-[#565656] font-light">
              Required only if applicable to your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="performs_laboratory_tests" className="text-[#0e274e] font-light">
                  Does your organization perform laboratory tests?
                </Label>
                <p className="text-sm text-[#565656] font-light">
                  If yes, CLIA Certificate Number is required
                </p>
              </div>
              <Switch
                id="performs_laboratory_tests"
                checked={performsLaboratoryTests}
                onCheckedChange={setPerformsLaboratoryTests}
                className="data-[state=checked]:bg-[#00bceb]"
              />
            </div>
            {performsLaboratoryTests && (
              <div className="space-y-2">
                <Label htmlFor="clia_certificate_number" className="text-[#0e274e] font-light">
                  CLIA Certificate Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="clia_certificate_number"
                  placeholder="Enter CLIA certificate number"
                  value={formData.clia_certificate_number}
                  onChange={(e) =>
                    setFormData({ ...formData, clia_certificate_number: e.target.value })
                  }
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="serves_medicare_patients" className="text-[#0e274e] font-light">
                  Does your organization serve Medicare patients?
                </Label>
                <p className="text-sm text-[#565656] font-light">
                  If yes, Medicare Provider Number is required
                </p>
              </div>
              <Switch
                id="serves_medicare_patients"
                checked={servesMedicarePatients}
                onCheckedChange={setServesMedicarePatients}
                className="data-[state=checked]:bg-[#00bceb]"
              />
            </div>
            {servesMedicarePatients && (
              <div className="space-y-2">
                <Label htmlFor="medicare_provider_number" className="text-[#0e274e] font-light">
                  Medicare Provider Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="medicare_provider_number"
                  placeholder="Enter Medicare provider number"
                  value={formData.medicare_provider_number}
                  onChange={(e) =>
                    setFormData({ ...formData, medicare_provider_number: e.target.value })
                  }
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Optional but Recommended */}
        <Card className="card-premium-enter stagger-item border-0 shadow-sm rounded-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#00bceb]" />
              <CardTitle className="text-xl font-light text-[#0e274e]">
                Optional but Recommended
              </CardTitle>
            </div>
            <CardDescription className="text-[#565656] font-light">
              These fields enhance your compliance documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone_number" className="text-[#0e274e] font-light">
                  Primary Phone Number
                </Label>
                <Input
                  id="phone_number"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email_address" className="text-[#0e274e] font-light">
                  Primary Email Address
                </Label>
                <Input
                  id="email_address"
                  type="email"
                  placeholder="contact@example.com"
                  value={formData.email_address}
                  onChange={(e) =>
                    setFormData({ ...formData, email_address: e.target.value })
                  }
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="text-[#0e274e] font-light">
                Website
              </Label>
              <Input
                id="website"
                type="url"
                placeholder="https://www.example.com"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accreditation_status" className="text-[#0e274e] font-light">
                  Accreditation Status
                </Label>
                <Input
                  id="accreditation_status"
                  placeholder="e.g., AAAHC, CLIA"
                  value={formData.accreditation_status}
                  onChange={(e) =>
                    setFormData({ ...formData, accreditation_status: e.target.value })
                  }
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="types_of_services" className="text-[#0e274e] font-light">
                  Types of Services
                </Label>
                <Input
                  id="types_of_services"
                  placeholder="e.g., Primary Care, Cardiology"
                  value={formData.types_of_services}
                  onChange={(e) =>
                    setFormData({ ...formData, types_of_services: e.target.value })
                  }
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="insurance_coverage" className="text-[#0e274e] font-light">
                Insurance Coverage
              </Label>
              <Input
                id="insurance_coverage"
                placeholder="e.g., Cyber insurance, Malpractice"
                value={formData.insurance_coverage}
                onChange={(e) =>
                  setFormData({ ...formData, insurance_coverage: e.target.value })
                }
                className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}
