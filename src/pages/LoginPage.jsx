import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/bootstrap.css';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryData, setCountryData] = useState({ countryCode: 'us', dialCode: '1' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const validation = validatePhoneNumber(phoneNumber, countryData);

    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    login(validation.formattedPhoneNumber);

    setError('');
    navigate('/pokemon');
  }

  return (
    <main className="auth-shell">
      <section className="auth-card shadow-lg" aria-labelledby="login-title">
        <div className="mb-4">
          <p className="login-brand-title auth-title">Pokémon Encyclopedia</p>
          <h1 id="login-title" className="display-title">Trainer Login</h1>
          <p className="text-secondary mb-0">
            Enter any phone number to log in.
          </p>
        </div>

        <form className="d-grid gap-3" onSubmit={handleSubmit}>
          <div>
            <label className="form-label fw-semibold" htmlFor="phone-input">
              Phone number
            </label>
            <PhoneInput
              country="us"
              value={phoneNumber}
              onChange={(value, data) => {
                setPhoneNumber(value);
                setCountryData(data);
              }}
              inputProps={{
                id: 'phone-input',
                name: 'phone',
                required: true,
                'aria-describedby': error ? 'login-error' : undefined
              }}
              containerClass="phone-container"
              inputClass="phone-control"
              buttonClass="phone-dropdown"
              enableSearch
            />
          </div>

          {error && (
            <div className="alert alert-danger mb-0" id="login-error" role="alert">
              {error}
            </div>
          )}

          <button className="btn btn-brand btn-lg w-100" type="submit">
            Login
          </button>
        </form>
      </section>
    </main>
  );
}

function validatePhoneNumber(phoneNumber, countryData) {
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  const dialCode = countryData?.dialCode || '';
  const nationalNumber = digitsOnly.startsWith(dialCode)
    ? digitsOnly.slice(dialCode.length)
    : digitsOnly;
  const expectedDigitCount = getExpectedDigitCount(countryData);

  if (!digitsOnly) {
    return { isValid: false, message: 'Phone number is required.' };
  }

  if (!dialCode || !nationalNumber) {
    return { isValid: false, message: 'Enter a valid phone number.' };
  }

  if (expectedDigitCount && digitsOnly.length !== expectedDigitCount) {
    return { isValid: false, message: 'Enter a valid phone number.' };
  }

  if (/^(\d)\1+$/.test(nationalNumber)) {
    return { isValid: false, message: 'Enter a valid phone number.' };
  }

  return {
    isValid: true,
    formattedPhoneNumber: `+${digitsOnly}`
  };
}

function getExpectedDigitCount(countryData) {
  if (!countryData?.format) {
    return null;
  }

  return countryData.format.split('').filter((character) => character === '.').length;
}
