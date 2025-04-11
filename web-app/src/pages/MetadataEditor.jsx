import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function TokenDescription({ wallet }) {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    description: '',
    externalUrl: '',
    attributes: []
  });
  
  const [errors, setErrors] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  
  // Load saved metadata from localStorage if available
  useEffect(() => {
    const savedMetadata = localStorage.getItem('tokenMetadata');
    if (savedMetadata) {
      const parsed = JSON.parse(savedMetadata);
      setFormData({
        description: parsed.description || '',
        externalUrl: parsed.externalUrl || '',
        attributes: parsed.attributes || []
      });
    }
    
    // Check if token configuration exists
    const tokenConfig = localStorage.getItem('tokenConfig');
    if (!tokenConfig) {
      // If token configuration doesn't exist, redirect to config page
      alert('Please configure your token first');
      navigate('/config');
    }
  }, [navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const addAttribute = () => {
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { trait_type: '', value: '' }]
    }));
  };
  
  const updateAttribute = (index, field, value) => {
    const updatedAttributes = [...formData.attributes];
    updatedAttributes[index] = {
      ...updatedAttributes[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      attributes: updatedAttributes
    }));
  };
  
  const removeAttribute = (index) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }
    
    if (formData.externalUrl && !isValidUrl(formData.externalUrl)) {
      newErrors.externalUrl = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Save the metadata to localStorage
      const metadataToSave = {
        ...formData
      };
      
      localStorage.setItem('tokenMetadata', JSON.stringify(metadataToSave));
      
      setIsSaved(true);
      
      // Navigate to deployment page after a brief delay
      setTimeout(() => {
        navigate('/deploy');
      }, 1500);
    }
  };
  
  return (
    <div className="token-description-container">
      <h2>Token Description</h2>
      <p>Add descriptive information about your token for future reference</p>
      
      <div className="info-banner">
        <p>
          <strong>Note:</strong> This information is saved for your reference only. To make this information 
          display in wallets and explorers, you'll need to follow the steps in our <Link to="/metadata-guide">Metadata Guide</Link> after deployment.
        </p>
      </div>
      
      {!wallet ? (
        <div className="connect-wallet-prompt">
          <p>Please connect your wallet first to continue.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="token-description-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="description">Description*</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your token's purpose and features"
                className={errors.description ? "error" : ""}
                rows={4}
              />
              {errors.description && <div className="error-message">{errors.description}</div>}
              <small>A brief description of your token (max 500 characters)</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="externalUrl">External URL</label>
              <input
                id="externalUrl"
                name="externalUrl"
                type="text"
                value={formData.externalUrl}
                onChange={handleChange}
                placeholder="https://yourproject.com"
                className={errors.externalUrl ? "error" : ""}
              />
              {errors.externalUrl && <div className="error-message">{errors.externalUrl}</div>}
              <small>Website or resource related to this token (optional)</small>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Attributes</h3>
            <p>Add custom attributes for your own reference</p>
            
            {formData.attributes.map((attr, index) => (
              <div key={index} className="attribute-row">
                <div className="attribute-field">
                  <input
                    type="text"
                    value={attr.trait_type}
                    onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                    placeholder="Attribute name"
                  />
                </div>
                <div className="attribute-field">
                  <input
                    type="text"
                    value={attr.value}
                    onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                    placeholder="Value"
                  />
                </div>
                <button
                  type="button"
                  className="remove-attribute"
                  onClick={() => removeAttribute(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            
            <button
              type="button"
              className="add-attribute-btn"
              onClick={addAttribute}
            >
              + Add Attribute
            </button>
          </div>
          
          <div className="form-actions">
            {isSaved && <div className="success-message">Description saved successfully!</div>}
            <button type="button" className="secondary-btn" onClick={() => navigate('/token-config')}>
              Back
            </button>
            <button type="submit" className="primary-btn">
              Continue to Deployment
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default TokenDescription;