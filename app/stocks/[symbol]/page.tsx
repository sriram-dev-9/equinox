import {redirect} from "next/navigation";

const StockRedirect = ({ params }: { params: { symbol: string } }) => {
    redirect(`/dashboard/stocks/${params.symbol}`);
};

export default StockRedirect;