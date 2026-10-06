# Checkpoint — Issue 10 partial (SalesCrmViews.jsx)
# Context carried from interrupted turn.

## Issue 10a (DONE, in SalesCrmViews.jsx)
- PROPOSAL_STATUS_COLOR added: submitted_for_review:'info', pm_approved:'success', pm_rejected:'error'

## Issue 10b (DONE, in SalesCrmViews.jsx)
- SalesClients now accepts employees prop; uses empLookup (employee_code -> name) 
  instead of rendering raw c.account_manager_id

## Next steps (from interrupted plan)
1. Finish SalesClients account-manager cell rendering (use empLookup)
2. Issue 1 (Leads tab + owner assignment + unowned leads in sales list + owner_name)
3. Issue 8 (ContactForm.jsx + contact.schema.js + AdminPanel ConvertToLeadModal pass-through)
4. Issue 3 (AdminPanel duplicate lead guard)
5. Issue 4 (LeadFlowPage Convert-to-Client button)
6. Issue 6 (ProjectManagerViews resubmit logic)
7. Issue 2 (post project updates UI)
8. Issue 7 (milestone/deliverable PM management)
9. Issue 9 (invoice project_id + admin tab + invoice_number)
10. Issue 5 (contract sign strand — already fixed on disk per summary)
