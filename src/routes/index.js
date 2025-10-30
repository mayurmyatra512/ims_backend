import express from 'express';
import partiesRouter from './parties.route.js';
import servicesRouter from './services.route.js';
import invoicesRouter from './invoices.route.js';
import userRouter from './user.route.js';
import dashboardRouter from './dashboard.route.js';
import bankRouter from './bank.route.js';
import companyRouter from './company.route.js';
import billNumberRouter from './billNumber.route.js';
import settingRouter from './setting.route.js';
import itemRouter from './items.route.js';
import brandsRouter from './brands.route.js';
import categoriesRouter from './categories.route.js';
import subcategoriesRouter from './subCategories.route.js';
import itemBatchRouter from './itemsBatch.route.js';

const router = express.Router();

router.use('/api/parties', partiesRouter);
router.use('/api/services', servicesRouter);
router.use('/api/items', itemRouter);
router.use('/api/item-batches', itemBatchRouter);
router.use('/api/invoices', invoicesRouter);
router.use('/api/user', userRouter);
router.use('/api/dashboard', dashboardRouter);
router.use('/api/bank', bankRouter);
router.use('/api/company', companyRouter);
router.use('/api/billnumber', billNumberRouter);
router.use('/api/setting', settingRouter);
router.use('/api/categories', categoriesRouter);
router.use('/api/subcategories', subcategoriesRouter);
router.use('/api/brands', brandsRouter);

router.get('/', (req, res) => {
  res.send('Welcome to the API');
});
export default router;