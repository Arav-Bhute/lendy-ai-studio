import { Router } from 'express';
import { store } from '../db/store.js';

export const applicationsRouter = Router();

// GET /api/applications - List all applications with borrower details
applicationsRouter.get('/', async (req, res) => {
  const apps = await store.getAllApplications();
  res.json({
    success: true,
    data: apps,
  });
});

// GET /api/applications/:id - Full details for workspace
applicationsRouter.get('/:id', async (req, res) => {
  const id = req.params.id;
  const data = await store.getApplication(id);
  if (!data) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Application ${id} not found.` },
    });
  }
  res.json({
    success: true,
    data,
  });
});

// POST /api/applications - Create new application
applicationsRouter.post('/', async (req, res) => {
  const { borrower, application, documents } = req.body;

  if (!borrower || !application) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Borrower and application fields are required.' },
    });
  }

  const created = await store.createApplication({
    borrower: {
      name: borrower.name || 'New Borrower',
      dateOfBirth: borrower.dateOfBirth || '1990-01-01',
      phone: borrower.phone || '+91 90000 00000',
      email: borrower.email || 'borrower@example.com',
      employmentType: borrower.employmentType || 'Salaried - Full Time',
      employer: borrower.employer || 'Self-Employed',
      yearsEmployed: Number(borrower.yearsEmployed) || 2.0,
    },
    application: {
      loanAmount: Number(application.loanAmount) || 1000000,
      loanPurpose: application.loanPurpose || 'Personal / General Use',
      loanTenure: Number(application.loanTenure) || 36,
      interestRate: Number(application.interestRate) || 10.5,
      creditScore: Number(application.creditScore) || 700,
      assignedOfficer: application.assignedOfficer || 'Arjun Kapoor',
      collateralValue: Number(application.collateralValue) || 0,
      monthlyIncome: Number(application.monthlyIncome) || 80000,
      monthlyDebt: Number(application.monthlyDebt) || 20000,
    },
    initialDocuments: documents || [
      { documentType: 'Bank Statement', fileName: 'Bank_Statement_Trailing6M.pdf', snippet: 'Automated upload during application intake.' },
      { documentType: 'Salary Slip', fileName: 'Recent_Salary_Slip.pdf', snippet: 'Verified employer payroll deposit.' },
      { documentType: 'Identity Document', fileName: 'National_Identity_Card.pdf', snippet: 'Government Photo ID verified.' }
    ],
  });

  res.status(201).json({
    success: true,
    data: created,
  });
});

// PATCH /api/applications/:id - Update application status or details
applicationsRouter.patch('/:id', async (req, res) => {
  const id = req.params.id;
  const updated = await store.updateApplication(id, req.body);
  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Application ${id} not found.` },
    });
  }
  res.json({
    success: true,
    data: updated,
  });
});
