import React from 'react';
import Image from 'next/image';
import { MigrantFormData } from './MigrantFormPDF';
import { format } from 'date-fns';

interface MigrantFormHTMLProps {
  formData: MigrantFormData;
  printable?: boolean;
}

// Format dates for display
const formatDate = (date: Date | null | undefined): string => {
  if (!date) return 'Not provided';
  return format(new Date(date), 'dd-MM-yyyy');
};

const MigrantFormHTML: React.FC<MigrantFormHTMLProps> = ({ formData, printable = false }) => {
  return (
    <div className={`migrant-form-container ${printable ? 'printable' : ''}`}>
      <style jsx>{`
        .migrant-form-container {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ccc;
          background-color: white;
        }
        
        .printable {
          padding: 0;
          border: none;
        }
        
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          position: relative;
          text-align: center;
        }
        
        .logo-container {
          width: 60px;
          height: 60px;
          position: relative;
        }
        
        .header-text {
          flex-grow: 1;
          text-align: center;
        }
        
        .header-text h1 {
          font-size: 14px;
          font-weight: bold;
          margin: 0;
          text-transform: uppercase;
        }
        
        .header-text h2 {
          font-size: 12px;
          margin: 5px 0;
          text-transform: uppercase;
        }
        
        .form-title {
          font-size: 16px;
          font-weight: bold;
          text-align: center;
          margin: 20px 0;
          text-transform: uppercase;
        }
        
        .form-number {
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 10px;
        }
        
        .photo-qr-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .qr-code {
          width: 80px;
          height: 80px;
          border: 1px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
        }
        
        .applicant-photo {
          width: 80px;
          height: 100px;
          border: 1px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
        }
        
        .section-title {
          font-size: 14px;
          font-weight: bold;
          margin: 20px 0 10px 0;
          text-transform: uppercase;
        }
        
        .form-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .form-table th, .form-table td {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
          font-size: 12px;
        }
        
        .form-table th {
          font-weight: bold;
          width: 40%;
        }
        
        .declaration-section {
          margin: 30px 0;
        }
        
        .declaration-text {
          font-size: 12px;
          margin-bottom: 15px;
          text-align: justify;
        }
        
        .declaration-swahili {
          font-size: 11px;
          margin-top: 20px;
          margin-bottom: 15px;
        }
        
        .signature-line {
          display: flex;
          justify-content: space-between;
          margin: 30px 0;
        }
        
        .signature-field {
          display: flex;
          flex-direction: column;
        }
        
        .signature-field-line {
          border-bottom: 1px solid #000;
          width: 200px;
          height: 20px;
          margin-bottom: 5px;
        }
        
        .signature-field-label {
          font-size: 10px;
        }
        
        .official-section {
          margin-top: 40px;
          border-top: 1px dashed #ccc;
          padding-top: 20px;
        }
        
        .official-title {
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 15px;
          text-align: center;
        }
        
        .page-number {
          text-align: right;
          font-size: 10px;
          margin-top: 20px;
        }
        
        @media print {
          .migrant-form-container {
            padding: 0;
            border: none;
          }
          
          @page {
            size: A4;
            margin: 20mm;
          }
        }
      `}</style>
      
      {/* Form Header */}
      <div className="form-header">
        <div className="logo-container">
          <Image 
            src="/images/coat_of_arm.png" 
            alt="Coat of Arms" 
            width={60} 
            height={60} 
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.src = '/images/coat-of-arms.png';
              // If that fails too, use a placeholder
              e.currentTarget.onerror = () => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiNlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIHNhbnMtc2VyaWYiIGZpbGw9IiM5OTkiPkNvYXQgb2YgQXJtczwvdGV4dD48L3N2Zz4=';
                e.currentTarget.onerror = null; // Prevent infinite loop
              };
            }}
          />
        </div>
        <div className="header-text">
          <h1>The United Republic of Tanzania</h1>
          <h2>Ministry of Home Affairs</h2>
          <h2>Immigration Services Department</h2>
        </div>
        <div className="logo-container">
          <Image 
            src="/images/immigration_logo.png" 
            alt="Immigration Logo" 
            width={60} 
            height={60}
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.src = '/images/coat-of-arms.png';
              // If that fails too, use a placeholder
              e.currentTarget.onerror = () => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiNlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIHNhbnMtc2VyaWYiIGZpbGw9IiM5OTkiPkxvZ288L3RleHQ+PC9zdmc+';
                e.currentTarget.onerror = null; // Prevent infinite loop
              };
            }}
          />
        </div>
        <div className="form-number">Form TF10</div>
      </div>
      
      <div className="form-title">Migrant Pass Application Form</div>
      
      {/* Photo and QR Code Section */}
      <div className="photo-qr-section">
        <div className="qr-code">QR CODE</div>
        <div className="applicant-photo">
          {/* Use a placeholder image since we don't have a photoUrl property */}
          <Image
            src="/images/user.png"
            alt="Applicant Photo"
            width={80}
            height={100}
            style={{ objectFit: 'cover' }}
            onError={(e) => {
              // If user.png fails, try applicant-photo.jpg
              e.currentTarget.src = '/images/applicant-photo.jpg';
              // If that fails too, use a placeholder
              e.currentTarget.onerror = () => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSIxMDAiIHZpZXdCb3g9IjAgMCA4MCAxMDAiPjxyZWN0IHdpZHRoPSI4MCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIHNhbnMtc2VyaWYiIGZpbGw9IiM5OTkiPlBIT1RPPC90ZXh0Pjwvc3ZnPg==';
                e.currentTarget.onerror = null; // Prevent infinite loop
              };
            }}
          />
        </div>
      </div>
      
      {/* Application Details Section */}
      <div className="section-title">1. Application Details</div>
      <table className="form-table">
        <tbody>
          <tr>
            <th>Application ID (namba ya ombi):</th>
            <td>{formData.applicationId || 'Not provided'}</td>
          </tr>
          <tr>
            <th>Applicant Full Name (jina kamili):</th>
            <td>{`${formData.firstName || ''} ${formData.middleName || ''} ${formData.lastName || ''}`}</td>
          </tr>
          <tr>
            <th>Former Name (Jina lingine):</th>
            <td>{formData.otherName || 'N/A'}</td>
          </tr>
          <tr>
            <th>Marital Status (Hali ya Ndoa):</th>
            <td>{formData.maritalStatus || 'N/A'}</td>
          </tr>
          <tr>
            <th>Date of Birth (Tarehe ya Kuzaliwa):</th>
            <td>{formatDate(formData.dateOfBirth)}</td>
          </tr>
          <tr>
            <th>Gender (Jinsi):</th>
            <td>{formData.gender?.toUpperCase() || 'N/A'}</td>
          </tr>
          <tr>
            <th>Country of Birth (Nchi ya Kuzaliwa):</th>
            <td>{formData.countryOfBirth?.toUpperCase() || 'N/A'}</td>
          </tr>
          <tr>
            <th>Region (Mkoa):</th>
            <td>{formData.region?.toUpperCase() || 'N/A'}</td>
          </tr>
          <tr>
            <th>Phone Number (Namba ya Simu):</th>
            <td>{formData.mobileNumber || 'N/A'}</td>
          </tr>
          <tr>
            <th>Occupation Type (Aina ya Kazi):</th>
            <td>{formData.occupationType || 'N/A'}</td>
          </tr>
          <tr>
            <th>Occupation (Kazi):</th>
            <td>{formData.occupation || 'N/A'}</td>
          </tr>
        </tbody>
      </table>
      
      {/* Residence Information Section */}
      <div className="section-title">2. Residence Information</div>
      <table className="form-table">
        <tbody>
          <tr>
            <th>Country of Residence (Nchi ya Makazi):</th>
            <td>{formData.countryOfResidence || 'N/A'}</td>
          </tr>
          <tr>
            <th>Region (Mkoa):</th>
            <td>{formData.residenceRegion || 'N/A'}</td>
          </tr>
          <tr>
            <th>District (Wilaya):</th>
            <td>{formData.district || 'N/A'}</td>
          </tr>
          <tr>
            <th>Street (Mtaa):</th>
            <td>{formData.street || 'N/A'}</td>
          </tr>
          <tr>
            <th>Permanent Address (Makazi ya Kudumu):</th>
            <td>{formData.permanentAddress || 'N/A'}</td>
          </tr>
          <tr>
            <th>Date of Entry in Tz (Tarehe ya Kuingia Nchini Tanzania):</th>
            <td>{formatDate(formData.dateOfEntry)}</td>
          </tr>
        </tbody>
      </table>
      
      {/* Parents Information Section */}
      <div className="section-title">3. Parents Information</div>
      <table className="form-table">
        <tbody>
          <tr>
            <th>Father Name (Jina la Baba):</th>
            <td>{formData.fatherName || 'N/A'}</td>
          </tr>
          <tr>
            <th>Date of Birth (Tarehe ya Kuzaliwa):</th>
            <td>{formatDate(formData.fatherDateOfBirth)}</td>
          </tr>
          <tr>
            <th>Country of Birth (Nchi ya Kuzaliwa):</th>
            <td>{formData.fatherCountryOfBirth || 'N/A'}</td>
          </tr>
          <tr>
            <th>Region (Mkoa):</th>
            <td>{formData.fatherRegion || 'N/A'}</td>
          </tr>
          <tr>
            <th>Nationality (Taifa):</th>
            <td>{formData.fatherNationality || 'N/A'}</td>
          </tr>
          <tr>
            <th>Country of Residence (Nchi ya Makazi):</th>
            <td>{formData.fatherCountryOfResidence || 'N/A'}</td>
          </tr>
        </tbody>
      </table>
      
      <table className="form-table">
        <tbody>
          <tr>
            <th>Mother Name (Jina la Mama):</th>
            <td>{formData.motherName || 'N/A'}</td>
          </tr>
          <tr>
            <th>Date of Birth (Tarehe ya Kuzaliwa):</th>
            <td>{formatDate(formData.motherDateOfBirth)}</td>
          </tr>
          <tr>
            <th>Country of Birth (Nchi ya Kuzaliwa):</th>
            <td>{formData.motherCountryOfBirth || 'N/A'}</td>
          </tr>
          <tr>
            <th>Region (Mkoa):</th>
            <td>{formData.motherRegion || 'N/A'}</td>
          </tr>
          <tr>
            <th>Nationality (Taifa):</th>
            <td>{formData.motherNationality || 'N/A'}</td>
          </tr>
          <tr>
            <th>Country of Residence (Nchi ya Makazi):</th>
            <td>{formData.motherCountryOfResidence || 'N/A'}</td>
          </tr>
        </tbody>
      </table>
      
      {/* Dependants Information Section */}
      <div className="section-title">4. Dependants Information</div>
      <table className="form-table">
        <tbody>
          <tr>
            <th>Name (Jina):</th>
            <td>{formData.dependantName || 'N/A'}</td>
          </tr>
          <tr>
            <th>Relationship (Mahusiano):</th>
            <td>{formData.dependantRelationship || 'N/A'}</td>
          </tr>
          <tr>
            <th>Passport Number (Namba ya Pasipoti):</th>
            <td>{formData.dependantPassportNumber || 'N/A'}</td>
          </tr>
          <tr>
            <th>Issue Date (Tarehe ya Kuanza):</th>
            <td>{formatDate(formData.dependantIssueDate)}</td>
          </tr>
          <tr>
            <th>End Date (Tarehe ya Kumaliza):</th>
            <td>{formatDate(formData.dependantEndDate)}</td>
          </tr>
        </tbody>
      </table>
     
       {/* Migrant Declaration */}
      <div className="declaration-section">
        <div className="section-title">5. Migrant Declaration</div>
        <div className="declaration-text">
          I __________________________________ declare that the information I have provided above is correct and I am ready to be held legally accountable for the information I have given.
        </div>
        
        <div className="declaration-swahili">
          <strong>TAMKO LA MHAMIAJI</strong>
          <p>
            Mimi __________________________________ ninathibitisha ya kwamba taarifa
            nilizozitoa hapo juu ni sahihi na nipo tayari kuwajibika kisheria kutokana na taarifa nilizozitoa.
          </p>
        </div>
        
        <div className="signature-line">
          <div className="signature-field">
            <div className="signature-field-line"></div>
            <div className="signature-field-label">Signature (Sahihi)</div>
          </div>
          <div className="signature-field">
            <div className="signature-field-line"></div>
            <div className="signature-field-label">Date (Tarehe)</div>
          </div>
        </div>
      </div>
      
      {/* Official Use Section */}
      <div className="official-section">
        <div className="official-title">FOR OFFICIAL PURPOSES ONLY (KWA MATUMIZI YA OFISI)</div>
        <div>Action taken by Immigration Officer</div>
        <div>(Hatua iliyochukuliwa na Afisa Uhamiaji): _______________________</div>
        
        <div className="signature-line">
          <div className="signature-field">
            <div className="signature-field-line"></div>
            <div className="signature-field-label">Signature (Sahihi)</div>
          </div>
          <div className="signature-field">
            <div className="signature-field-line"></div>
            <div className="signature-field-label">Date (Tarehe)</div>
          </div>
        </div>
      </div>
      
      <div className="page-number">Page 1 of 1</div>
    </div>
  );
};

export default MigrantFormHTML;
