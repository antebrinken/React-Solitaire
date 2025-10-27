import ConfigurationsForm from "../../Components/Forms/ConfigurationsForm/ConfigurationsForm.component";
import { FormattedMessage } from "react-intl";
import PageTitle from "../../Components/PageTitle/PageTitle.component";
import React from "react";

function ConfigurationsPage() {
  return (
    <div className="mainPage">
      <PageTitle title={<FormattedMessage id="sidebar.configurations" />} />
      <ConfigurationsForm />
    </div>
  );
}
export default ConfigurationsPage;
