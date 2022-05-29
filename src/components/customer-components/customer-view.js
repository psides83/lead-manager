import React from "react";
import CustomerAppBar from "./customer-app-bar";
import CustomerDashboard from "./customer-dashboard";

function CustomerView(props) {
  const { customer } = props;

  return (
    <>
      <CustomerDashboard customer={customer} />
    </>
  );
}

export default CustomerView;
