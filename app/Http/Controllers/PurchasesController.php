<?php

namespace Salesfly\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

use Salesfly\Salesfly\Repositories\PurchaseRepo;
use Salesfly\Salesfly\Managers\PurchaseManager;
use Salesfly\Salesfly\Repositories\DetailPurchaseRepo;
use Salesfly\Salesfly\Managers\DetailPurchaseManager;
use Salesfly\Salesfly\Repositories\StockRepo;
use Salesfly\Salesfly\Managers\StockManager;

use Salesfly\Salesfly\Repositories\PaymentRepo;
use Salesfly\Salesfly\Managers\PaymentManager;

use Salesfly\Salesfly\Repositories\PendientAccountRepo;
use Salesfly\Salesfly\Managers\PendientAccountManager;

use Salesfly\Salesfly\Repositories\DetPaymentRepo;
use Salesfly\Salesfly\Managers\DetPaymentManager;

use Salesfly\Salesfly\Repositories\InputStockRepo;
use Salesfly\Salesfly\Managers\InputStockManager;

use Salesfly\Salesfly\Repositories\HeadInputStockRepo;
use Salesfly\Salesfly\Managers\HeadInputStockManager;

use Salesfly\Salesfly\Repositories\OrderPurchaseRepo;
use Salesfly\Salesfly\Managers\OrderPurchaseManager;

use Salesfly\Salesfly\Repositories\DetailOrderPurchaseRepo;
use Salesfly\Salesfly\Managers\DetailOrderPurchaseManager; 
//use Intervention\Image\Facades\Image;

class PurchasesController extends Controller {

    protected $purchaseRepo;

   /** public function __construct(PurchaseRepo $purchaseRepo)
    {
        $this->purchaseRepo = $purchaseRepo;
    }*/

    public function __construct(OrderPurchaseRepo $orderPurchaseRepo,DetailOrderPurchaseRepo $detailOrderPurchaseRepo,HeadInputStockRepo $headInputStockRepo,InputStockRepo $inputStockRepo,DetPaymentRepo $detPaymentRepo,PendientAccountRepo $pendientAccountRepo,PaymentRepo $paymentRepo,DetailPurchaseRepo $detailPurchaseRepo, PurchaseRepo $purchaseRepo,StockRepo $stockRepo)
    {
        $this->detailPurchaseRepo = $detailPurchaseRepo;
        $this->purchaseRepo = $purchaseRepo;
        $this->stockRepo = $stockRepo;
        $this->paymentRepo=$paymentRepo;
        $this->pendientAccountRepo=$pendientAccountRepo;
        $this->detPaymentRepo=$detPaymentRepo;
        $this->inputStockRepo=$inputStockRepo;
        $this->headInputStockRepo=$headInputStockRepo;
        $this->detailOrderPurchaseRepo=$detailOrderPurchaseRepo;
        $this->orderPurchaseRepo=$orderPurchaseRepo;
    }

    public function index()
    {
        return View('purchases.index');
    }
    /*public function mostarUltimoagregado(){
        $purchases=$this->purchaseRepo->ultimoDato();
         return response()->json($purchases);
    }*/
    public function all()
    {
        $purchases = $this->purchaseRepo->paginate(15);
        return response()->json($purchases);
        //var_dump($purchases);
    }

    public function paginatep(){
        $purchases = $this->purchaseRepo->paginar(15);
        return response()->json($purchases);
        
    }
   public function form_showD(){
     return View('purchases.showD');
   }

    public function form_create()
    {
        return View('purchases.form_create');
    }

    public function form_edit()
    {
        return View('purchases.form_edit');
    }

    public function create(Request $request)
        {
        // var_dump($request->all());die();
    \DB::beginTransaction();
        $saldoTemp=0;
        $codigoHeadIS=0;
        $purchase = $this->purchaseRepo->getModel();
        $payment = $this->paymentRepo->getModel();
        $pendientAccount=$this->pendientAccountRepo->getModel();
        $var = $request->detailOrderPurchases;
        $almacen_id=$request->input("warehouses_id");
        //var_dump($request->input('estado'));
       // var_dump($var);die();
      //==================================Cancelar Factura
      if($request->input('estado')==2){
             //var_dump("hola");die();
        foreach($var as $object){
         $stockmodel = new StockRepo;

                  $object['warehouse_id']=$almacen_id;
                  $object["variant_id"]=$object["Codigovar"];
                  $stockac=$stockmodel->encontrar($object["variant_id"],$almacen_id);
                  //var_dump($stockac);die();
            if(!empty($stockac)){ 
              
               $object["porLlegar"]=floatval($stockac->porLlegar)-floatval($object["cantidad"]);
                $manager = new StockManager($stockac,$object);
                  $manager->save();
                  $stock=null;
            }
            //}
            $stockac=null;
          }

                $orderPurchase = $this->orderPurchaseRepo->find($request->id);
       
                $ordercompra = new OrderPurchaseManager($orderPurchase,$request->except('fechaPedido','fechaPrevista','montoBruto','montoTotal','descuento'));
                $ordercompra->save(); 
             if($this->orderPurchaseRepo->validateDate(substr($request->input('fechaPedido'),0,10)) and $this->orderPurchaseRepo->validateDate(substr($request->input('fechaPrevista'),0,10))){
                   $orderPurchase->fechaPedido = substr($request->input('fechaPedido'),0,10);
                   $orderPurchase->fechaPrevista = substr($request->input('fechaPrevista'),0,10);
             }else{
           
            $orderPurchase->fechaPedido = null;
            $orderPurchase->fechaPrevista = null;
        }

        $orderPurchase->save();
                   $payment1 = $this->paymentRepo->paymentById($request->input('id'));
                   $pendientAccount=$this->pendientAccountRepo->getModel();

                   //$pendientAcc=$this->pendientAccountRepo->verSaldos($payment1->id);
              if($payment1!=null){  
                  $detPayment=$this->detPaymentRepo->verPagosAdelantados($payment1->id); 
                if($detPayment!=null){
                  foreach($detPayment as  $detPayment) {
                    $request->merge(["estado"=>0]);
                     $SaldosTemporales =$this->pendientAccountRepo->find2($detPayment['Saldo_F']);
                     if($SaldosTemporales!=null){
                     $request->merge(['Saldo'=>$SaldosTemporales->Saldo+$detPayment['montoPagado']]);
                     $request->merge(['orderPurchase_id'=>$SaldosTemporales->orderPurchase_id]);
                     $request->merge(['supplier_id'=>$SaldosTemporales->supplier_id]);
                     $insercount=new PendientAccountManager($SaldosTemporales,$request->all());
                     $insercount->save();
                     }else{
                        $request->merge(['orderPurchase_id'=>$request->input('id')]);
                        $request->merge(['Saldo'=>$payment1->Acuenta]);
                        $insercount=new PendientAccountManager($pendientAccount,$request->all());
                        $insercount->save();
                     }
                 
                  }
                  }else{   
                  $request->merge(['orderPurchase_id'=>$request->input('id')]);
                  $request->merge(['Saldo'=>$payment1->Acuenta]);
                  $insercount=new PendientAccountManager($pendientAccount,$request->all());
                  $insercount->save();
                  $provicional=$request->idpayment;
                }
        }
}else
{
        //===================================UpdateOrderPurchase===========================================
      if($request->input('estado')==1){
       
      $request->merge(["Estado"=>1]);
     // var_dump($request->input("Estado"));die();
       $orderPurchase = $this->orderPurchaseRepo->find($request->id);
       //var_dump($orderPurchase->Estado);die();
       $ordercompra = new OrderPurchaseManager($orderPurchase,$request->except('fechaPedido','fechaPrevista','montoBruto','montoTotal','descuento'));
       $ordercompra->save(); 
    if($this->orderPurchaseRepo->validateDate(substr($request->input('fechaPedido'),0,10)) and $this->orderPurchaseRepo->validateDate(substr($request->input('fechaPrevista'),0,10))){
            $orderPurchase->fechaPedido = substr($request->input('fechaPedido'),0,10);
             $orderPurchase->fechaPrevista = substr($request->input('fechaPrevista'),0,10);
        }else{
           
            $orderPurchase->fechaPedido = null;
             $orderPurchase->fechaPrevista = null;
        }

        $orderPurchase->save();
        $verSiExiste=$this->detailOrderPurchaseRepo->Comprobar($request->id);
        //***************************************************************
        if(!empty($verSiExiste[0])){
        //var_dump("no deve entrar");die();
      $orderPurchase->detPres()->detach();
       foreach($var as $object1){
        //$hola=$var[$n];
        //$object[]
        $object1["Cantidad_Ll"]=$object1["cantidad1"];
        $object1["pendiente"]=floatval($object1["cantidad"])-floatval($object1["cantidad1"]);
       /*if(!empty($object1["cantidad1"])){
            //var_dump("holay".$object1["cantidad1"]);die();
            //$object1["cantidad"]=$object1["Cantidad_Ll"];
            //$object1["pendiente"]=$object1["pendiente"];
            $object1["montoBruto"]=floatval($object1["cantidad"])*floatval($object1["preProducto"]);
            $object1["montoTotal"]=floatval($object1["montoBruto"])-((floatval($object1["montoBruto"])*floatval($object1["descuento"]))/100);
        }else{
            //var_dump("dos".$object1["cantidad1"]);die();
          
            if($object1["Cantidad_Ll"]=='0' && $object1["montoBruto"]=='0'){
              $object1["Cantidad_Ll"]=0;
              $object1["pendiente"]=$object1["cantidad"];
              $object1["montoBruto"]=floatval($object1["cantidad"])*floatval($object1["preProducto"]);
              $object1["montoTotal"]=floatval($object1["montoBruto"])-((floatval($object1["montoBruto"])*floatval($object1["descuento"]))/100);
            }else{
                if($object1["Cantidad_Ll"]>0){
                     $object1["Cantidad_Ll"]=$object1["cantidad"];
                     $object1["pendiente"]=0;
                     $object1["montoBruto"]=floatval($object1["cantidad"])*floatval($object1["preProducto"]);
                     $object1["montoTotal"]=floatval($object1["montoBruto"])-((floatval($object1["montoBruto"])*floatval($object1["descuento"]))/100);
                }else{  
                     $object1["Cantidad_Ll"]=$object1["cantidad"];
                     $object1["pendiente"]=0;
                     $object1["montoBruto"]=floatval($object1["cantidad"])*floatval($object1["preProducto"]);
                     $object1["montoTotal"]=floatval($object1["montoBruto"])-((floatval($object1["montoBruto"])*floatval($object1["descuento"]))/100);
            }
          }
        
        }*/
        ////if($hola->cantidad1!=null){
        ////    $object1["Cantidad_Ll"]=$hola->Cantidad_Ll;
        ////    $object1["pendiente"]=$hola->pendiente;
        ////    
        ////}else{
        ////    $object1["Cantidad_Ll"]=$object1["cantidad"];
        ////    $object1["pendiente"]=0;
        ////}
        //var_dump($hola['Cantidad_Ll']);die();
        if(floatval($object1["preCompra"])>0){
           
        $detailOrderPurchaseRepox = new DetailOrderPurchaseRepo;
        $insertar=new DetailOrderPurchaseManager($detailOrderPurchaseRepox->getModel(),$object1);
        $insertar->save();
        $detailOrderPurchaseRepox = null;
        //$n++;
      }
       }
    //   var_dump($var);die();
   } }
        //==============================================================================
        
        $codOrder=$request->input("orderPurchase_id");
        $fechaActual=$request->input("fecha");
        //var_dump($fechaActual);die();
        //=============================Creando compra =============================
       //var_dump($var); die();
        $manager = new PurchaseManager($purchase,$request->except('fechaEntrega'));
        $manager->save();

       if($this->purchaseRepo->validateDate(substr($request->input('fechaEntrega'),0,10))){
            $purchase->fechaEntrega = substr($request->input('fechaEntrega'),0,10);
        }else{
           
            $purchase->fechaEntrega = null;
        }

        $purchase->save();
        $temporal=$purchase->id;
       // return $temporal;
        $request->merge(["purchase_id"=>$temporal]);
        $detailPurchaseRepox;
        $consulPayment=null;
        //$almacen_id=$request->input("warehouses_id");
     
      
      //========================================================================
       $total=0;
       foreach($var as $object){
        
        //========================insertDEtalles=========================
           $object['orderPurchase_id']=$codOrder;
           $object['purchases_id'] = $temporal;
           $object['purchase_id']=$temporal;
           $object['Fecha']=$fechaActual;
           $object['warehouse_id']=$almacen_id;
           $object["variant_id"]=$object["Codigovar"];
           $stockmodel = new StockRepo;
           $stockac=$stockmodel->encontrar($object["variant_id"],$almacen_id);
           if($request->input('estado')==1){
           // var_dump($object1["cantidad1"]);
                $object["cantidad"]=$object["cantidad1"];
                $object["montoBruto"]=floatval($object["cantidad1"])*floatval($object["preProducto"]);
                $object["montoTotal"]=floatval($object["cantidad1"])*floatval($object["preCompra"]);
                $total=$total+$object["montoTotal"];
             //  var_dump($object["cantidad"]);
                /*if(!empty($object["cantidad1"])){
                   $object["cantidad"]=$object["Cantidad_Ll"];
                }else{
                  if($object["preCompra"]==0){
                          $object["cantidad"]=$object["cantidad"];
                    }else{
                          if($object["Cantidad_Ll"]==0 && $object["montoBruto"]==0)
                          {
                             $object["cantidad"]=$object["Cantidad_Ll"];
                          }else{
                           //if(floatval($object["Cantidad_Ll"])>0){
                           //   $object["cantidad"]=$object["Cantidad_Ll"]; 
                           //}else{
                             $object["cantidad"]=$object["cantidad"];
                           //}
                      }
                }
           }**/
           //***************************************************
           // $stockmodel = new StockRepo;
                  //$object['warehouse_id']=$almacen_id;
                  //$object["variant_id"]=$object["Codigovar"];
                  //$stockac=$stockmodel->encontrar($object["variant_id"],$almacen_id);
               $cantidaCalculada=floatval($object["cantidad1"])-floatval($object["Cantidad_Ll"]);
                  /*
                  if(!empty($object["cantidad1"])){
                      $cantidaCalculada=floatval($object["cantidad1"])-floatval($object["Cantidad_Ll"]);
                  }else{ 
                    if($object["preCompra"]==0){
                          $cantidaCalculada=floatval($object["cantidad"]);
                    }else{
                         if($object["Cantidad_Ll"]==0 && $object["montoBruto"]==0){
                               $cantidaCalculada=0;
                          }else{
                         $cantidaCalculada=floatval($object["cantidad"])-floatval($object["Cantidad_Ll"]);
                          }
                    }
                  }*/
      //*****************ssss*************************
           }else{
              $stockmodel = new StockRepo;
              $object['warehouse_id']=$almacen_id;
              $object["variant_id"]=$object["Codigovar"];
              $cantidaCalculada=$object["cantidad"];
           }
           //$object["cantidad"]=$cantidaCalculada;
           if(intval($object["cantidad"]>0)){
           //var_dump($object);die();
           $detailPurchaseRepox = new DetailPurchaseRepo;
           $insertar=new DetailPurchaseManager($detailPurchaseRepox->getModel(),$object);
           $insertar->save();
           $detailPurchaseRepox = null;
         }
        if($request->input('estado')==1){
          $purchase1 = $this->purchaseRepo->find($temporal);
          $request->merge(['montoBruto'=>floatval($total)]);
          if(!empty($purchase1->descuento)){
          $request->merge(['montoTotal'=>floatval($total)-((floatval($total)*floatval($purchase1->descuento))/100)]);
        }else{
          $request->merge(['montoTotal'=>floatval($total)]);
        }
          $manager = new PurchaseManager($purchase1,$request->except('fechaEntrega'));
          $manager->save();
       
         }

        //======================Si Existe Stock Pendiente Por Agregar===============================
        if($cantidaCalculada>0){
          $inputStock = $this->inputStockRepo->getModel();
          $object["warehouses_id"]=$request->input("warehouses_id");
          $object["cantidad_llegado"]=$cantidaCalculada;
          $object['descripcion']='Entrada por compra';
          $object['tipo']='Entrada';
          //$request->merge(["orderPurchase_id"=>$request->input('id')]);
          ////======================Registrando en notas de cabecera===============================
               
          if($codigoHeadIS===0 && $cantidaCalculada>0){
               $headInputStock = $this->headInputStockRepo->getModel();
              //var_dump($object);die();
               $object["user_id"]=auth()->user()->id;
               $inserHeadInputStock = new HeadInputStockManager($headInputStock,$object);
               $inserHeadInputStock->save();
               $codigoHeadIS=$headInputStock->id;
               }
       ////======================Registrando en notas de detalles===============================cantidad_llegado
              //if(!empty($object["equivalencia"])){
              //  if($object["equivalencia"]>0){
              //    $object["cantidad_llegado"]=$object["cantidad_llegado"]*$object["equivalencia"];
              //  }
              //}
              $object['headInputStock_id']=$codigoHeadIS;
              $inserInputStock = new inputStockManager($inputStock,$object);
              $inserInputStock->save();
            if(!empty($stockac)){ 
                //if($object["esbase"]==0){
                  //var_dump($object);die();
                //  $object["stockActual"]=$stockac->stockActual+($cantidaCalculada*$object["equivalencia"]);
               // }else{
                  $object["stockActual"]=$stockac->stockActual+$cantidaCalculada;
                  if(!empty($object["Cantidad_Ll"])){
                  $object["porLlegar"]=floatval($stockac->porLlegar)-(floatval($object["cantidad"])-floatval($object["Cantidad_Ll"]));
               }
                //}
      //======================Actualizando stock si es que variante existe===============================
                  $manager = new StockManager($stockac,$object);
                  $manager->save();
                  $stock=null;
            }else{
                //if($object["esbase"]==0)
                //{
                //    $object["stockActual"]=$cantidaCalculada*$object["equivalencia"];
               // }else{
                    $object["stockActual"]=$cantidaCalculada;
                    $object["porLlegar"]=floatval($stockac->porLlegar)-floatval($object["cantidad"]);
                //}
      //======================Registrando estock si es que variante no existe===============================
                  $manager = new StockManager($stockmodel->getModel(),$object);
                  $manager->save();
                  $stockmodel = null;
            }
            $stockac=null;
         }
       }
      //======================Creando reporte por cada linea de detalle de compra===============================
       //====================Creando y actualizando pagos si que existe adelantos====================================
        if($request->input('compraDirecta')==1){
          $request->merge(["Acuenta"=>0]);
          $inserPay=new PaymentManager($payment,$request->all());
          $inserPay->save();
          
        }else{
        $consulPayment=$this->paymentRepo->paymentById($purchase->orderPurchase_id);
        if($consulPayment==null){
          $request->merge(["Acuenta"=>0]);
          $inserPay=new PaymentManager($payment,$request->all());
          $inserPay->save();
          //------------------------------------
          

        }else{

              $request->merge(["Acuenta"=>$consulPayment->Acuenta]);
              $request->merge(["Saldo"=>(floatval($request->input("montoTotal"))-floatval($request->input("Acuenta")))]);
              $inserPay=new PaymentManager($consulPayment,$request->all());
              $inserPay->save();
              //$saldoTemp=$inserPay->Saldo;
        }
      }
      if($request->input('Saldo')<0){
           
            $request->merge(['Saldo'=>$request->input('Saldo')*-1]);
            //$request->merge(["estado"=>0]);
            $insercount=new PendientAccountManager($pendientAccount,$request->except("estado"));
            $insercount->save();
             
        }
       if($consulPayment!=null){
        $detPayment=$this->detPaymentRepo->verPagosAdelantados($consulPayment->id);
          if($detPayment!=null){       
          
          foreach($detPayment as $detPayment){

          if($detPayment->Saldo_F!=null){
               $saldos=$this->pendientAccountRepo->find2($detPayment['Saldo_F']);
            if($saldos!=null){
              if($saldos->Saldo==0){                
                 $request->merge(['Saldo'=>0]);
                 $request->merge(['estado'=>1]);
                 $request->merge(['orderPurchase_id'=>$saldos->orderPurchase_id]);
                 $request->merge(['supplier_id'=>$saldos->supplier_id]);
                 $insercount=new PendientAccountManager($saldos,$request->all());
                 $insercount->save();
              }
            }
            }
          }
       }}

        ///==========================Registrando saldo Afavor ========================================

}
      \DB::commit();
     return response()->json(['estado'=>true, 'nombres'=>$purchase->nombres]);
    }
    public function reportes($id){
   
        //var_dump($object["cantidad"]);die();
        $database = \Config::get('database.connections.mysql');
        $time=time();
        $output = public_path() . '/report/'.$time.'_Tiket';        
        $ext = "pdf";
        
        \JasperPHP::process(
            public_path() . '/report/Tiket.jasper', 
            $output, 
            array($ext),
            //array(),
            //while($i<=3){};
            ['idVariante'=>intval($id)],//Parametros
           

            $database,
            false,
            false
        )->execute();
        //echo("<a href='localhost:8007/report/".$time."_Tiket.".$ext."'>Genrar</a>");
      
        //return response()->json(['estado'=>true]);
        return '/report/'.$time.'_Tiket.'.$ext;
    }
     public function reportesCod($id){
     // var_dump("hola commd");die();
        $database = \Config::get('database.connections.mysql');
        $time=time();
        $output = public_path() . '/report/'.$time.'_CodigoBarras';        
        $ext = "pdf";
        
        \JasperPHP::process(
            public_path() . '/report/CodigoBarras.jasper', 
            $output, 
            array($ext),
            //array(),
            //while($i<=3){};
            ['VarCode'=>$id],//Parametros
              
            $database,
            false,
            false
        )->execute();
        return '/report/'.$time.'_CodigoBarras.'.$ext;
   
    }
     public function reporteRangoFechas($fech1,$fech2){
       // var_dump($fech1."/".$fech2);die();
        $database = \Config::get('database.connections.mysql');
        $time=time();
        $output = public_path() . '/report/'.$time.'_comprasEFechas';        
        $ext = "pdf";
        
        \JasperPHP::process(
            public_path() . '/report/comprasEFechas.jasper', 
            $output, 
            array($ext),
            //array(),
            //while($i<=3){};
            ['fechaini' =>$fech1,'fechafin'=>$fech2],//Parametros
              
            $database,
            false,
            false
        )->execute();
        return '/report/'.$time.'_comprasEFechas.'.$ext;
    }
     public function reportepagosProveedor($idPro){
       // var_dump($fech1."/".$fech2);die();
        $database = \Config::get('database.connections.mysql');
        $time=time();
        $output = public_path() . '/report/'.$time.'_reportePagosProveedor';        
        $ext = "pdf";
        
        \JasperPHP::process(
            public_path() . '/report/reporteCompraFechas.jasper', 
            $output, 
            array($ext),
            //array(),
            //while($i<=3){};
            ['supplier_id' => $idPro],//Parametros
              
            $database,
            false,
            false
        )->execute();
        return '/report/'.$time.'_reportePagosProveedor.'.$ext;
    }
    public function reportepagos($id){
     
       // var_dump($fech1."/".$fech2);die();
        $database = \Config::get('database.connections.mysql');
        $time=time();
        $output = public_path() . '/report/'.$time.'_reportePagos';        
        $ext = "pdf";
        
        \JasperPHP::process(
            public_path() . '/report/reportePagos.jasper', 
            $output, 
            array($ext),
            //array(),
            //while($i<=3){};
            ['payments_id' => $id],//Parametros
              
            $database,
            false,
            false
        )->execute();
        return '/report/'.$time.'_reportePagos.'.$ext;
    }
    public function find($id)
    {
        $purchase = $this->purchaseRepo->select($id);
        return response()->json($purchase);
    }
    public function paginar1($fecha1,$fecha2){
      $purchase = $this->purchaseRepo->paginar1($fecha1,$fecha2);
        return response()->json($purchase);
    }
    public function mostrarEmpresa($id){
    $purchase=$this->purchaseRepo->traerSumplier($id);
    return response()->json($purchase);
    }

    public function edit(Request $request)
    {
      \DB::beginTransaction();
       $purchase = $this->purchaseRepo->find($request->id);

        $manager = new PurchaseManager($purchase,$request->except('fechaEntrega'));
        $manager->save();
       if($this->purchaseRepo->validateDate(substr($request->input('fechaEntrega'),0,10))){
            $purchase->fechaEntrega = substr($request->input('fechaEntrega'),0,10);
        }else{
           
            $purchase->fechaEntrega = null;
        }

        $purchase->save();
        \DB::commit();
        return response()->json(['estado'=>true, 'nombres'=>$purchase->nombres]);
       
       
    }

    public function destroy(Request $request)
    {
        $purchase= $this->purchaseRepo->find($request->id);
        $purchase->delete();
        //Event::fire('update.purchase',$purchase->all());
        return response()->json(['estado'=>true, 'nombre'=>$purchase->nombre]);
    }

    public function search($q)
    {
        //$q = Input::get('q');
        $purchases = $this->purchaseRepo->search($q);

        return response()->json($purchases);
    }
    public function show()
    {
        return View('purchases.show');
    }
}