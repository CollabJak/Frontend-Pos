import { CustomerGroup } from "./customerGroups";
import { CustomerGroupPrice } from "./customerGroupPrices";
import { CompositeCustomerGroupFormData } from "../Schemas/compositeCustomerGroupSchema";

export interface CustomerGroupWithPrices extends CustomerGroup {
  prices: CustomerGroupPrice[];
}

export interface CustomerGroupWizardFormProps {
  initialData?: CustomerGroupWithPrices | null;
  onSubmit: (data: CompositeCustomerGroupFormData) => Promise<void> | void;
  isPending: boolean;
  serverError?: string;
  isEdit?: boolean;
}

export type { CompositeCustomerGroupFormData };
