'use client';

import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { updateOrganization, type OrganizationFormData } from '@/app/actions/organization';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
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
  validateUSZIP,
  validateUSState,
  validateUSAddress,
  validateCLIA
} from '@/lib/organization-constants';
import { Checkbox } from '@/components/ui/checkbox';

interface OrganizationFormProps {
  initialData: any;
}

export function OrganizationForm({ initialData }: OrganizationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Basic organization fields
  const [country] = useState<'US'>('US'); // HIPAA is only for United States
  const [practiceTypePrimary, setPracticeTypePrimary] = useState(
    initialData?.practice_type_primary || initialData?.type || 'medical'
  );
  const [specialties, setSpecialties] = useState<string[]>(() => {
    if (!initialData?.specialties) return [];
    if (Array.isArray(initialData.specialties)) return initialData.specialties;
    if (typeof initialData.specialties === 'string') {
      try {
        const parsed = JSON.parse(initialData.specialties);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [state, setState] = useState(initialData?.state || '');
  const [addressState, setAddressState] = useState(initialData?.address_state || '');
  const [addressZip, setAddressZip] = useState(initialData?.address_zip || '');
  
  // Officers
  const [securityOfficerRole, setSecurityOfficerRole] = useState(
    initialData?.security_officer_role_type || initialData?.security_officer_role || 'hipaa-security-officer'
  );
  const [securityOfficerRoleOther, setSecurityOfficerRoleOther] = useState(
    initialData?.security_officer_role_other || ''
  );
  const [privacyOfficerRole, setPrivacyOfficerRole] = useState(
    initialData?.privacy_officer_role_type || initialData?.privacy_officer_role || 'hipaa-privacy-officer'
  );
  const [privacyOfficerRoleOther, setPrivacyOfficerRoleOther] = useState(
    initialData?.privacy_officer_role_other || ''
  );
  
  // Organization structure
  const [employeeCount, setEmployeeCount] = useState(
    initialData?.employee_count || 1
  );
  const [numberOfLocations, setNumberOfLocations] = useState(
    initialData?.number_of_locations || 1
  );
  const [multiStateOperations, setMultiStateOperations] = useState(
    initialData?.multi_state_operations || false
  );
  const [remoteWorkforce, setRemoteWorkforce] = useState(
    initialData?.remote_workforce || false
  );
  
  // Technology
  const [ehrSystem, setEhrSystem] = useState(
    initialData?.ehr_system && initialData.ehr_system.trim() !== '' 
      ? initialData.ehr_system 
      : 'not-applicable'
  );
  const [emailProvider, setEmailProvider] = useState(
    initialData?.email_provider && initialData.email_provider.trim() !== ''
      ? initialData.email_provider
      : 'not-specified'
  );
  const [cloudStorageProvider, setCloudStorageProvider] = useState(
    initialData?.cloud_storage_provider && initialData.cloud_storage_provider.trim() !== ''
      ? initialData.cloud_storage_provider
      : 'not-using-cloud'
  );
  const [usesVpn, setUsesVpn] = useState(initialData?.uses_vpn || false);
  const [vpnProvider, setVpnProvider] = useState(
    initialData?.vpn_provider && initialData.vpn_provider.trim() !== ''
      ? initialData.vpn_provider
      : 'not-specified'
  );
  const [deviceTypes, setDeviceTypes] = useState<string[]>(() => {
    if (!initialData?.device_types) return [];
    if (Array.isArray(initialData.device_types)) return initialData.device_types;
    if (typeof initialData.device_types === 'string') {
      try {
        const parsed = JSON.parse(initialData.device_types);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  
  // Conditional fields
  const [performsLaboratoryTests, setPerformsLaboratoryTests] = useState(
    initialData?.performs_laboratory_tests || false
  );
  const [servesMedicarePatients, setServesMedicarePatients] = useState(
    initialData?.serves_medicare_patients || false
  );
  
  // Contact information (controlled inputs)
  const [primaryContactName, setPrimaryContactName] = useState(
    initialData?.primary_contact_name || ''
  );
  const [complianceContactEmail, setComplianceContactEmail] = useState(
    initialData?.compliance_contact_email || ''
  );
  const [complianceContactPhone, setComplianceContactPhone] = useState(
    initialData?.compliance_contact_phone || ''
  );
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Update hidden inputs when switches change
  useEffect(() => {
    const performsInput = document.querySelector('input[name="performs_laboratory_tests"]') as HTMLInputElement;
    const medicareInput = document.querySelector('input[name="serves_medicare_patients"]') as HTMLInputElement;
    if (performsInput) performsInput.value = performsLaboratoryTests ? 'on' : 'off';
    if (medicareInput) medicareInput.value = servesMedicarePatients ? 'on' : 'off';
  }, [performsLaboratoryTests, servesMedicarePatients]);

  // Update state when initialData changes (e.g., after data is loaded)
  useEffect(() => {
    if (initialData) {
      console.log('OrganizationForm: initialData received', initialData);
      setEmployeeCount(initialData.employee_count || 1);
      setPracticeTypePrimary(initialData.practice_type_primary || initialData.type || 'medical');
      // Country is always US for HIPAA
      setSpecialties(
        Array.isArray(initialData.specialties) 
          ? initialData.specialties 
          : (initialData.specialties ? [initialData.specialties] : [])
      );
      setState(initialData.state || '');
      setAddressState(initialData.address_state || '');
      setAddressZip(initialData.address_zip || '');
      setSecurityOfficerRole(initialData.security_officer_role_type || initialData.security_officer_role || 'hipaa-security-officer');
      setSecurityOfficerRoleOther(initialData.security_officer_role_other || '');
      setPrivacyOfficerRole(initialData.privacy_officer_role_type || initialData.privacy_officer_role || 'hipaa-privacy-officer');
      setPrivacyOfficerRoleOther(initialData.privacy_officer_role_other || '');
      setNumberOfLocations(initialData.number_of_locations || 1);
      setMultiStateOperations(initialData.multi_state_operations || false);
      setRemoteWorkforce(initialData.remote_workforce || false);
      setEhrSystem(
        initialData.ehr_system && initialData.ehr_system.trim() !== ''
          ? initialData.ehr_system
          : 'not-applicable'
      );
      setEmailProvider(
        initialData.email_provider && initialData.email_provider.trim() !== ''
          ? initialData.email_provider
          : 'not-specified'
      );
      setCloudStorageProvider(
        initialData.cloud_storage_provider && initialData.cloud_storage_provider.trim() !== ''
          ? initialData.cloud_storage_provider
          : 'not-using-cloud'
      );
      setUsesVpn(initialData.uses_vpn || false);
      setVpnProvider(
        initialData.vpn_provider && initialData.vpn_provider.trim() !== ''
          ? initialData.vpn_provider
          : 'not-specified'
      );
      setDeviceTypes(
        Array.isArray(initialData.device_types) 
          ? initialData.device_types 
          : (initialData.device_types ? [initialData.device_types] : [])
      );
      setPerformsLaboratoryTests(initialData.performs_laboratory_tests || false);
      setServesMedicarePatients(initialData.serves_medicare_patients || false);
      
      // Update contact information fields
      setPrimaryContactName(initialData.primary_contact_name || '');
      setComplianceContactEmail(initialData.compliance_contact_email || '');
      setComplianceContactPhone(initialData.compliance_contact_phone || '');
    } else {
      console.log('OrganizationForm: No initialData provided');
    }
  }, [initialData]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      const data: OrganizationFormData = {
        legal_name: String(formData.get('legal_name')).trim(),
        dba: String(formData.get('dba')).trim() || undefined,
        practice_type_primary: (formData.get('practice_type_primary') || formData.get('type') || 'medical') as any,
        specialties: formData.get('specialties') ? JSON.parse(String(formData.get('specialties'))) : undefined,
        state: String(formData.get('state')).trim(),
        country: 'US' as const,
        address_street: String(formData.get('address_street')).trim(),
        address_city: String(formData.get('address_city')).trim(),
        address_state: String(formData.get('address_state')).trim(),
        address_zip: String(formData.get('address_zip')).trim(),
        security_officer_name: String(formData.get('security_officer_name')).trim(),
        security_officer_email: String(formData.get('security_officer_email')).trim(),
        security_officer_role: (formData.get('security_officer_role_type') || formData.get('security_officer_role') || 'hipaa-security-officer') as any,
        security_officer_role_other: String(formData.get('security_officer_role_other')).trim() || undefined,
        privacy_officer_name: String(formData.get('privacy_officer_name')).trim(),
        privacy_officer_email: String(formData.get('privacy_officer_email')).trim(),
        privacy_officer_role: (formData.get('privacy_officer_role_type') || formData.get('privacy_officer_role') || 'hipaa-privacy-officer') as any,
        privacy_officer_role_other: String(formData.get('privacy_officer_role_other')).trim() || undefined,
        employee_count: employeeCount,
        has_employees: formData.get('has_employees') === 'on',
        uses_contractors: formData.get('uses_contractors') === 'on',
        number_of_locations: formData.get('number_of_locations') ? parseInt(String(formData.get('number_of_locations'))) : 1,
        multi_state_operations: formData.get('multi_state_operations') === 'on',
        remote_workforce: formData.get('remote_workforce') === 'on',
        stores_phi_electronically: formData.get('stores_phi_electronically') === 'on',
        ehr_system: String(formData.get('ehr_system')).trim() || undefined,
        email_provider: String(formData.get('email_provider')).trim() || undefined,
        cloud_storage_provider: String(formData.get('cloud_storage_provider')).trim() || undefined,
        uses_vpn: formData.get('uses_vpn') === 'on',
        vpn_provider: String(formData.get('vpn_provider')).trim() || undefined,
        device_types: formData.get('device_types') ? JSON.parse(String(formData.get('device_types'))) : undefined,
        primary_contact_name: primaryContactName.trim() || undefined,
        compliance_contact_email: complianceContactEmail.trim() || undefined,
        compliance_contact_phone: complianceContactPhone.trim() || undefined,
        // US HIPAA Required Legal Identifiers
        ein: formData.get('ein') ? String(formData.get('ein')).trim() : undefined,
        npi: formData.get('npi') ? String(formData.get('npi')).trim() : undefined,
        state_license_number: String(formData.get('state_license_number')).trim() || undefined,
        state_tax_id: String(formData.get('state_tax_id')).trim() || undefined,
        // Authorized Representative / CEO
        authorized_representative_name: String(formData.get('authorized_representative_name')).trim() || undefined,
        authorized_representative_title: String(formData.get('authorized_representative_title')).trim() || undefined,
        ceo_name: String(formData.get('ceo_name')).trim() || undefined,
        ceo_title: String(formData.get('ceo_title')).trim() || undefined,
        // Conditional Fields
        performs_laboratory_tests: formData.get('performs_laboratory_tests') === 'on',
        clia_certificate_number: String(formData.get('clia_certificate_number')).trim() || undefined,
        serves_medicare_patients: formData.get('serves_medicare_patients') === 'on',
        medicare_provider_number: String(formData.get('medicare_provider_number')).trim() || undefined,
        // Optional but Recommended
        phone_number: String(formData.get('phone_number')).trim() || undefined,
        email_address: String(formData.get('email_address')).trim() || undefined,
        website: String(formData.get('website')).trim() || undefined,
        accreditation_status: String(formData.get('accreditation_status')).trim() || undefined,
        types_of_services: String(formData.get('types_of_services')).trim() || undefined,
        insurance_coverage: String(formData.get('insurance_coverage')).trim() || undefined,
      };

      await updateOrganization(data);
      toast.success('Organization information updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update organization information');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Organization Identity */}
      <Card className="border-0 shadow-sm rounded-none bg-white">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#00bceb]" fill="currentColor" fillOpacity={0.3} strokeWidth={1.5} />
            <CardTitle className="text-xl font-light text-[#0e274e]">
              Organization Identity
            </CardTitle>
          </div>
          <CardDescription className="text-[#565656] font-light">
            Legal information about your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
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
              <input type="hidden" name="country" value="US" />
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
                name="legal_name"
                defaultValue={initialData?.legal_name || initialData?.name || ''}
                placeholder="Enter legal organization name"
                className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dba" className="text-[#0e274e] font-light">
                DBA (Doing Business As)
              </Label>
              <Input
                id="dba"
                name="dba"
                defaultValue={initialData?.dba || ''}
                placeholder="Optional"
                className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
              />
            </div>
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
              <input type="hidden" name="practice_type_primary" value={practiceTypePrimary} />
              {/* Backward compatibility */}
              <input type="hidden" name="type" value={practiceTypePrimary} />
            </div>
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
            <input type="hidden" name="specialties" value={JSON.stringify(specialties)} />
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
                  // Auto-update address state if empty
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
              <input type="hidden" name="state" value={state} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Primary Business Address */}
      <Card className="border-0 shadow-sm rounded-none bg-white">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#00bceb]" fill="currentColor" fillOpacity={0.3} strokeWidth={1.5} />
            <CardTitle className="text-xl font-light text-[#0e274e]">
              Primary Business Address
            </CardTitle>
          </div>
          <CardDescription className="text-[#565656] font-light">
            Juridically critical for contracts and breach notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="address_street" className="text-[#0e274e] font-light">
              Street Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address_street"
              name="address_street"
              defaultValue={initialData?.address_street || ''}
              placeholder="Enter street address"
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
                name="address_city"
                defaultValue={initialData?.address_city || ''}
                placeholder="Enter city"
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
                  name="address_state"
                  value={addressState}
                  onChange={(e) => setAddressState(e.target.value)}
                  defaultValue={initialData?.address_state || ''}
                  placeholder="Enter state/province"
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                  required
                />
              )}
              <input type="hidden" name="address_state" value={addressState} />
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
                name="address_zip"
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
                defaultValue={initialData?.address_zip || ''}
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
      <Card className="border-0 shadow-sm rounded-none bg-white">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#00bceb]" fill="currentColor" fillOpacity={0.3} strokeWidth={1.5} />
            <CardTitle className="text-xl font-light text-[#0e274e]">
              Security Officer
            </CardTitle>
          </div>
          <CardDescription className="text-[#565656] font-light">
            HIPAA requires names, not generic titles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="security_officer_name" className="text-[#0e274e] font-light">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="security_officer_name"
                name="security_officer_name"
                defaultValue={initialData?.security_officer_name || ''}
                placeholder="Enter full name"
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
                name="security_officer_email"
                type="email"
                defaultValue={initialData?.security_officer_email || ''}
                placeholder="Enter email"
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
              <input type="hidden" name="security_officer_role" value={securityOfficerRole} />
              <input type="hidden" name="security_officer_role_type" value={securityOfficerRole} />
              {securityOfficerRole === 'other' && (
                <Input
                  placeholder="Specify role"
                  value={securityOfficerRoleOther}
                  onChange={(e) => setSecurityOfficerRoleOther(e.target.value)}
                  className="mt-2 border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                />
              )}
              <input type="hidden" name="security_officer_role_other" value={securityOfficerRoleOther} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Officer */}
      <Card className="border-0 shadow-sm rounded-none bg-white">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#00bceb]" fill="currentColor" fillOpacity={0.3} strokeWidth={1.5} />
            <CardTitle className="text-xl font-light text-[#0e274e]">
              Privacy Officer
            </CardTitle>
          </div>
          <CardDescription className="text-[#565656] font-light">
            Can be the same person as Security Officer, but name must exist
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="privacy_officer_name" className="text-[#0e274e] font-light">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="privacy_officer_name"
                name="privacy_officer_name"
                defaultValue={initialData?.privacy_officer_name || ''}
                placeholder="Enter full name"
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
                name="privacy_officer_email"
                type="email"
                defaultValue={initialData?.privacy_officer_email || ''}
                placeholder="Enter email"
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
              <input type="hidden" name="privacy_officer_role" value={privacyOfficerRole} />
              <input type="hidden" name="privacy_officer_role_type" value={privacyOfficerRole} />
              {privacyOfficerRole === 'other' && (
                <Input
                  placeholder="Specify role"
                  value={privacyOfficerRoleOther}
                  onChange={(e) => setPrivacyOfficerRoleOther(e.target.value)}
                  className="mt-2 border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                />
              )}
              <input type="hidden" name="privacy_officer_role_other" value={privacyOfficerRoleOther} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Structure */}
      <Card className="border-0 shadow-sm rounded-none bg-white">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#00bceb]" fill="currentColor" fillOpacity={0.3} strokeWidth={1.5} />
            <CardTitle className="text-xl font-light text-[#0e274e]">
              Organization Structure
            </CardTitle>
          </div>
          <CardDescription className="text-[#565656] font-light">
            Information about your workforce
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
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
            <input
              type="hidden"
              name="employee_count"
              value={employeeCount}
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
                name="has_employees"
                defaultChecked={initialData?.has_employees !== false}
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
                name="uses_contractors"
                defaultChecked={initialData?.uses_contractors || false}
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
                name="number_of_locations"
                type="number"
                min="1"
                value={numberOfLocations}
                onChange={(e) => setNumberOfLocations(parseInt(e.target.value) || 1)}
                className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
              />
              <input type="hidden" name="number_of_locations" value={numberOfLocations} />
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
                name="multi_state_operations"
                checked={multiStateOperations}
                onCheckedChange={setMultiStateOperations}
                className="data-[state=checked]:bg-[#00bceb]"
              />
              <input type="hidden" name="multi_state_operations" value={multiStateOperations ? 'on' : 'off'} />
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
                name="remote_workforce"
                checked={remoteWorkforce}
                onCheckedChange={setRemoteWorkforce}
                className="data-[state=checked]:bg-[#00bceb]"
              />
              <input type="hidden" name="remote_workforce" value={remoteWorkforce ? 'on' : 'off'} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technology */}
      <Card className="border-0 shadow-sm rounded-none bg-white">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Laptop className="h-5 w-5 text-[#00bceb]" fill="currentColor" fillOpacity={0.3} strokeWidth={1.5} />
            <CardTitle className="text-xl font-light text-[#0e274e]">
              Technology Infrastructure
            </CardTitle>
          </div>
          <CardDescription className="text-[#565656] font-light">
            Detailed information about your technology systems (impacts Security Policy)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
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
              name="stores_phi_electronically"
              defaultChecked={initialData?.stores_phi_electronically !== false}
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
            <input type="hidden" name="ehr_system" value={ehrSystem === 'not-applicable' ? '' : ehrSystem} />
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
            <input type="hidden" name="email_provider" value={emailProvider === 'not-specified' ? '' : emailProvider} />
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
            <input type="hidden" name="cloud_storage_provider" value={cloudStorageProvider === 'not-using-cloud' ? '' : cloudStorageProvider} />
            {/* Backward compatibility */}
            <input type="hidden" name="uses_cloud_services" value={cloudStorageProvider ? 'on' : 'off'} />
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
                name="uses_vpn"
                checked={usesVpn}
                onCheckedChange={setUsesVpn}
                className="data-[state=checked]:bg-[#00bceb]"
              />
              <input type="hidden" name="uses_vpn" value={usesVpn ? 'on' : 'off'} />
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
                <input type="hidden" name="vpn_provider" value={vpnProvider === 'not-specified' ? '' : vpnProvider} />
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
            <input type="hidden" name="device_types" value={JSON.stringify(deviceTypes)} />
          </div>
        </CardContent>
      </Card>

      {/* Optional Contact Information */}
      <Card className="border-0 shadow-sm rounded-none bg-white">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#00bceb]" fill="currentColor" fillOpacity={0.3} strokeWidth={1.5} />
            <CardTitle className="text-xl font-light text-[#0e274e]">
              Contact Information
            </CardTitle>
          </div>
          <CardDescription className="text-[#565656] font-light">
            Optional institutional contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_contact_name" className="text-[#0e274e] font-light">
                Primary Contact Name
              </Label>
              <Input
                id="primary_contact_name"
                name="primary_contact_name"
                value={primaryContactName}
                onChange={(e) => setPrimaryContactName(e.target.value)}
                placeholder="Optional"
                className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compliance_contact_email" className="text-[#0e274e] font-light">
                Compliance Contact Email
              </Label>
              <Input
                id="compliance_contact_email"
                name="compliance_contact_email"
                type="email"
                value={complianceContactEmail}
                onChange={(e) => setComplianceContactEmail(e.target.value)}
                placeholder="Optional"
                className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compliance_contact_phone" className="text-[#0e274e] font-light">
                Compliance Contact Phone
              </Label>
              <Input
                id="compliance_contact_phone"
                name="compliance_contact_phone"
                type="tel"
                value={complianceContactPhone}
                onChange={(e) => setComplianceContactPhone(e.target.value)}
                placeholder="Optional"
                className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* US HIPAA Required Legal Identifiers */}
      <Card className="border-l-4 border-[#00bceb] shadow-sm rounded-none bg-white">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#00bceb]" fill="currentColor" fillOpacity={0.3} strokeWidth={1.5} />
            <CardTitle className="text-xl font-light text-[#0e274e]">
              US Legal Identifiers (Required)
            </CardTitle>
          </div>
          <CardDescription className="text-[#565656] font-light">
            Mandatory identifiers for HIPAA compliance documents in the United States
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ein" className="text-[#0e274e] font-light">
                EIN (Employer Identification Number) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ein"
                name="ein"
                defaultValue={initialData?.ein || ''}
                placeholder="XX-XXXXXXX"
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
                name="npi"
                defaultValue={initialData?.npi || ''}
                placeholder="1234567890"
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
                name="state_license_number"
                defaultValue={initialData?.state_license_number || ''}
                placeholder="Enter state license number"
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
                name="state_tax_id"
                defaultValue={initialData?.state_tax_id || ''}
                placeholder="Enter state tax ID"
                className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CEO / Authorized Representative */}
      <Card className="border-0 shadow-sm rounded-none bg-white">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#00bceb]" fill="currentColor" fillOpacity={0.3} strokeWidth={1.5} />
            <CardTitle className="text-xl font-light text-[#0e274e]">
              CEO / Authorized Representative
            </CardTitle>
          </div>
          <CardDescription className="text-[#565656] font-light">
            Person authorized to sign legal documents and approve policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ceo_name" className="text-[#0e274e] font-light">
                CEO / Authorized Representative Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ceo_name"
                name="ceo_name"
                defaultValue={initialData?.ceo_name || ''}
                placeholder="Enter full name"
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
                name="ceo_title"
                defaultValue={initialData?.ceo_title || ''}
                placeholder="e.g., Chief Executive Officer, President"
                className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conditional Requirements */}
      <Card className="border-l-4 border-amber-400 shadow-sm rounded-none bg-white">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-600" fill="currentColor" fillOpacity={0.3} strokeWidth={1.5} />
            <CardTitle className="text-xl font-light text-[#0e274e]">
              Conditional Requirements
            </CardTitle>
          </div>
          <CardDescription className="text-[#565656] font-light">
            Required only if applicable to your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="performs_laboratory_tests" className="text-[#0e274e] font-light">
                Does your organization perform laboratory tests?
              </Label>
              <p className="text-sm text-[#565656] font-light">
                If yes, CLIA Certificate Number is required
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="performs_laboratory_tests"
                checked={performsLaboratoryTests}
                onCheckedChange={setPerformsLaboratoryTests}
                className="data-[state=checked]:bg-[#00bceb]"
              />
              <input
                type="hidden"
                name="performs_laboratory_tests"
                value={performsLaboratoryTests ? 'on' : 'off'}
              />
            </div>
          </div>
          {performsLaboratoryTests && (
            <div className="space-y-2">
              <Label htmlFor="clia_certificate_number" className="text-[#0e274e] font-light">
                CLIA Certificate Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="clia_certificate_number"
                name="clia_certificate_number"
                defaultValue={initialData?.clia_certificate_number || ''}
                placeholder="Enter CLIA certificate number"
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
            <div className="flex items-center gap-2">
              <Switch
                id="serves_medicare_patients"
                checked={servesMedicarePatients}
                onCheckedChange={setServesMedicarePatients}
                className="data-[state=checked]:bg-[#00bceb]"
              />
              <input
                type="hidden"
                name="serves_medicare_patients"
                value={servesMedicarePatients ? 'on' : 'off'}
              />
            </div>
          </div>
          {servesMedicarePatients && (
            <div className="space-y-2">
              <Label htmlFor="medicare_provider_number" className="text-[#0e274e] font-light">
                Medicare Provider Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="medicare_provider_number"
                name="medicare_provider_number"
                defaultValue={initialData?.medicare_provider_number || ''}
                placeholder="Enter Medicare provider number"
                className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optional but Recommended */}
      <Card className="border-0 shadow-sm rounded-none bg-white">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#00bceb]" fill="currentColor" fillOpacity={0.3} strokeWidth={1.5} />
            <CardTitle className="text-xl font-light text-[#0e274e]">
              Optional but Recommended
            </CardTitle>
          </div>
          <CardDescription className="text-[#565656] font-light">
            These fields enhance your compliance documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number" className="text-[#0e274e] font-light">
                Primary Phone Number
              </Label>
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                defaultValue={initialData?.phone_number || ''}
                placeholder="(555) 123-4567"
                className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email_address" className="text-[#0e274e] font-light">
                Primary Email Address
              </Label>
              <Input
                id="email_address"
                name="email_address"
                type="email"
                defaultValue={initialData?.email_address || ''}
                placeholder="contact@example.com"
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
              name="website"
              type="url"
              defaultValue={initialData?.website || ''}
              placeholder="https://www.example.com"
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
                name="accreditation_status"
                defaultValue={initialData?.accreditation_status || ''}
                placeholder="e.g., AAAHC, CLIA"
                className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="types_of_services" className="text-[#0e274e] font-light">
                Types of Services
              </Label>
              <Input
                id="types_of_services"
                name="types_of_services"
                defaultValue={initialData?.types_of_services || ''}
                placeholder="e.g., Primary Care, Cardiology"
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
              name="insurance_coverage"
              defaultValue={initialData?.insurance_coverage || ''}
              placeholder="e.g., Cyber insurance, Malpractice"
              className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#00bceb] text-white hover:bg-[#00bceb]/90 min-w-[200px] rounded-none font-bold"
        >
          {isSubmitting ? 'Saving...' : 'Save Organization Information'}
        </Button>
      </div>
    </form>
  );
}

