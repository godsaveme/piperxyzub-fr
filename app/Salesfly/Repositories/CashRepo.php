<?php
namespace Salesfly\Salesfly\Repositories;
use Salesfly\Salesfly\Entities\Cash;

class CashRepo extends BaseRepo{
    
    public function getModel()
    {
        
        return new Cash;
    }

    public function search($q)
    {
        if($q==0){
            $q='%%';
        }
        $cashes =Cash::where('cashHeader_id','like', $q)
                    //with(['customer','employee'])
                    ->paginate(15);
        return $cashes;
    }

    public function calculateMontoBruto($cash_id)
    {
        $montoMovimientoEfectivo = \DB::table('detCash')
                        ->where('cash_id',$cash_id)
                        ->sum('montoMovimientoEfectivo');

        $oCaja = Cash::find($cash_id);

        $montoBruto = $montoMovimientoEfectivo + $oCaja->montoInicial;

        return $montoBruto;
    }
} 