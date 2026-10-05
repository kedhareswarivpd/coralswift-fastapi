import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPublicContract, publicSignContract } from '../api/crm.js';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import Button from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';

export default function SignContractPage() {
  const { contractId } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [signerName, setSignerName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState(false);

  useEffect(() => {
    async function loadContract() {
      try {
        setLoading(true);
        const res = await fetchPublicContract(contractId);
        if (res.success && res.data) {
          setContract(res.data);
          if (res.data.contact_name) {
            setSignerName(res.data.contact_name);
          }
        } else {
          setError(res.message || 'Contract not found or invalid link.');
        }
      } catch (err) {
        setError(err.message || 'Could not load contract details.');
      } finally {
        setLoading(false);
      }
    }
    if (contractId) {
      loadContract();
    }
  }, [contractId]);

  const handleSignContract = async (e) => {
    e.preventDefault();
    if (!signerName.trim()) {
      setError('Please provide your full legal name to sign.');
      return;
    }
    if (!agreed) {
      setError('You must check the agreement box to proceed.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await publicSignContract(contractId, { signer_name: signerName });
      if (res.success) {
        setSignedSuccess(true);
        setContract((prev) => ({
          ...prev,
          status: 'signed',
          signed_by_client_at: new Date().toISOString(),
        }));
      } else {
        setError(res.message || 'Failed to sign contract. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Error executing digital signature.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 py-16 dark:bg-slate-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !contract) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16 dark:bg-slate-900">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-800">
          <Icon name="error" className="mx-auto mb-4 text-5xl text-rose-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Contract Error</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{error}</p>
          <Link to="/" className="mt-6 inline-block rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-brand-light">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const isAlreadySigned = contract?.status === 'signed' || Boolean(contract?.signed_by_client_at);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 dark:bg-slate-900">
      <div className="mx-auto max-w-3xl">
        {/* Document Header */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand dark:bg-brand/20 dark:text-brand-light">
                <Icon name="verified" className="text-sm" /> Digital Service Agreement
              </span>
              <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                CoralSwift Technologies Contract
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Prepared for <strong className="text-slate-700 dark:text-slate-200">{contract?.contact_name}</strong> {contract?.company_name && `(${contract?.company_name})`}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                isAlreadySigned 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {isAlreadySigned ? 'Fully Signed' : 'Pending Signature'}
              </span>
            </div>
          </div>

          <hr className="my-6 border-slate-200 dark:border-slate-700" />

          {/* Scope & Terms */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Scope of Work</h3>
              <div className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
                {contract?.scope_summary}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase text-slate-400">Total Investment</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  {contract?.currency} {Number(contract?.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase text-slate-400">Proposal Version</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  v{contract?.proposal_version}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Box / Success State */}
        {signedSuccess || isAlreadySigned ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-8 text-center shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/30">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
              <Icon name="check" className="text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-950 dark:text-emerald-200">Contract Signed Successfully!</h2>
            <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-300 max-w-lg mx-auto">
              Thank you for confirming your agreement. Your Client Portal account and project workspace have been automatically provisioned. Check your email for login credentials.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link to="/login" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700">
                <Icon name="login" /> Login to Client Portal
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSignContract} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Icon name="draw" className="text-brand" /> Digital Signature Execution
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Please enter your full legal name below to sign and execute this agreement online.
            </p>

            {error && (
              <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Full Legal Signature *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-serif text-lg text-slate-900 placeholder-slate-400 focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="agree_checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 size-4 rounded border-slate-300 text-brand focus:ring-brand"
                />
                <label htmlFor="agree_checkbox" className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 cursor-pointer">
                  I confirm that I am authorized to enter into this contract on behalf of my organization and agree to the scope and terms specified above.
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="mt-4 w-full justify-center text-base font-semibold py-3.5"
                disabled={submitting || !signerName.trim() || !agreed}
              >
                {submitting ? 'Executing Signature...' : 'Sign & Confirm Contract'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
