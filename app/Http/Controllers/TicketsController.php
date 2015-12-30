<?php

namespace Salesfly\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

use Salesfly\Salesfly\Entities\DetCash;
use Salesfly\Salesfly\Repositories\TicketRepo;
use Salesfly\Salesfly\Managers\TicketManager;
use Salesfly\Salesfly\Repositories\DetCashRepo;
use Salesfly\Salesfly\Managers\DetCashManager;
use Salesfly\User;
use Salesfly\Salesfly\Entities\Cash;

class TicketsController extends Controller {

    protected $ticketRepo;
    protected $detCashRepo;

    public function __construct(TicketRepo $ticketRepo, DetCashRepo $detCashRepo)
    {
        $this->ticketRepo = $ticketRepo;
        $this->detCashRepo = $detCashRepo;
    }

    public function index()
    {
        return View('types.index');
    }

    public function all()
    {
        $types = $this->typeRepo->paginate(15);
        return response()->json($types);
        //var_dump($types);
    }

    public function paginatep(){
        $types = $this->typeRepo->paginate(15);
        return response()->json($types);
    }


    public function form_create()
    {
        return View('types.form_create');
    }

    public function form_edit()
    {
        return View('types.form_edit');
    }

    public function create(Request $request)
    {
        \DB::beginTransaction();
        $fechaActual = date('Y-m-d H:i:s');
        //var_dump($fechaActual);
        //die();
        $oTicket = $this->ticketRepo->getModel();
        $oDetCash = $this->detCashRepo->getModel();

        //CONSULTAR SI CAJA ESTA ABIERTA;

        $openCash = Cash::find($request->input('cashfinal'));



        //var_dump($openCash);
        //die();

        if(count($openCash)>0 && $openCash->estado == 1 && $openCash->user_id == \Auth::user()->id) {

            $managerDetCash = new DetCashManager($oDetCash, ['fechaTransaccion' => $fechaActual,
                'montoMovimientoEfectivo' => $request->input('montoFinal'),
                'estado' => 1,
                'cashMotive_id' => 1,
                'cash_id' => $request->input('cashfinal'),


            ]);

            $managerDetCash->save();

            $concepto_id = 0;

            if ($request->input('concepto') == 'otro') {
                $concepto_id = $request->input('nombreConcepto.id');
            } else {
                $concepto_id = $request->input('concepto');
            }

            $managerTicket = new TicketManager($oTicket, ['fechaPedido' => $fechaActual,
                'precioUnit' => $request->input('precioUnitFinal'),
                'precioUnitFinal' => $request->input('precioUnitFinal'),
                'cantidad' => $request->input('cantidad'),
                'montoFinal' => $request->input('montoFinal'),
                'estado' => 1,
                'detCash_id' => $oDetCash->id,
                'concepto_id' => $concepto_id


            ]);

            $managerTicket->save();
            //Event::fire('update.Ttype',$Ttype->all());

            //$oEmpresa = \Salesfly\Salesfly\Entities\Store::find(1);
            $userName = User::find($openCash->user_id)->name;

            //var_dump($oTicket);
            //var_dump($openCash);
            //var_dump($userName);
            //die();
            $output = $this->generateTicketPaper($oTicket,$openCash,$userName);
            //var_dump($output); die();
            if($output == true){
                \DB::commit();
                return response()->json(['estado'=>true]);
            }else{
                return response()->json(['estado'=>false]);
            }
            //var_dump($openCash->cashHeader->msje); die();

        }

    }

    public function anularTicket(Request $request){

        //var_dump($request->all()); die();

        $oTicket = $this->ticketRepo->getModel()->find($request->input('id'));

        if($request->input('password') == '282592sistemaj'){
            if($oTicket->fechaAnulado == '0000-00-00 00:00:00'){
                $oTicket->fechaAnulado = date('Y-m-d H:i:s');
                $oTicket->estado = 0;
                $oTicket->motivo = $request->input('motivo');
                $oTicket->save();
                return response()->json(['estado'=>true, 'msje'=>'Ticket Anulado Correctamente']);
            }elseif($oTicket->fechaAnulado != '0000-00-00 00:00:00'){
                return response()->json(['estado'=>false, 'msje'=>'El Ticket se encuentra anulado']);
            }else{
                return response()->json(['estado'=>false, 'msje'=>'No se pudo determinar.']);
            }
        }else{
            return response()->json(['estado'=>false, 'msje'=>'Contraseña incorrecta.']);
        }
        //var_dump($oTicket);

    }

    public function find($id)
    {
        $Ttype = $this->typeRepo->find($id);
        return response()->json($Ttype);
    }

    public function edit(Request $request)
    {
        $Ttype = $this->typeRepo->find($request->id);
        //var_dump($Ttype);
        //die(); 
        $manager = new TypeManager($Ttype,$request->all());
        $manager->save();

        //Event::fire('update.Ttype',$Ttype->all());
        return response()->json(['estado'=>true, 'nombre'=>$Ttype->nombre]);
    }

    public function destroy(Request $request)
    {
        $Ttype= $this->typeRepo->find($request->id);
        $Ttype->delete();
        //Event::fire('update.Ttype',$Ttype->all());
        return response()->json(['estado'=>true, 'nombre'=>$Ttype->nombre]);
    }

    public function search($q)
    {
        //$q = Input::get('q');
        $types = $this->typeRepo->search($q);

        return response()->json($types);
    }

    public function searchType($q)
    {
        //$q = Input::get('q');
        $types = $this->typeRepo->searchType($q);

        return response()->json($types);
    }

    public function generateTicketPaper($oTicket,$openCash,$userName){
        $txt = '<?php require_once(dirname(__FILE__) . "/escpos-php-master/Escpos.php");
							//$logo = new EscposImage("images/productos/tostao.jpg");
							$printer = new Escpos();
							/* Print top logo */
                            $printer -> setJustification(Escpos::JUSTIFY_CENTER);
                            //$printer -> graphics($logo);
							$printer -> selectPrintMode(Escpos::MODE_DOUBLE_WIDTH);
							$printer -> text("'.$openCash->cashHeader->msje.'");
							$printer -> feed();
							$printer -> selectPrintMode();
							$printer -> setJustification(Escpos::JUSTIFY_LEFT);
							$printer -> feed();
							$printer -> text("Ticket N°: '.$oTicket->id.'");
							$printer -> feed();
							$printer -> text("Fecha y Hora: '.$oTicket->fechaPedido.'\n");
							$printer -> text("Cajero: '.$userName.'");
							$printer -> feed();
							$printer -> text("Caja: '.$openCash->cashHeader->nombre.'");
							$printer -> text("  # Ref. Caja: '.$openCash->id.'");
							$printer -> feed();
							$printer -> text("------------------------------------------\n");
							$printer -> text("Concepto: ");
							$printer -> setEmphasis(true);
                            $printer -> text("'.$oTicket->concepto->nombre.'");
                            $printer -> setEmphasis(false);
                            $printer -> feed();
                            $printer -> text("Precio Unit. S/.: ");
                            $printer -> text("'.number_format($oTicket->precioUnitFinal,2).'");
                            $printer -> feed();
                            $printer -> text("Cantidad: ");
                            $printer -> text("'.$oTicket->cantidad.'");
                            $printer -> feed();
                            $printer -> text("TOTAL S/.: ");
                            $printer -> setEmphasis(true);
                            $printer -> text("'.number_format($oTicket->montoFinal,2).'");
                            $printer -> setEmphasis(false);
                            $printer -> feed();


							$printer -> text("------------------------------------------\n");';



        //$txt .= '$printer -> text("------------------------------------------------\n");';
        //$txt .= '$printer -> text("Boleta[] Factura[] / Consumo[] Detall.[]\n");';
        $txt .= '$printer -> feed();';
        $txt .= '$printer -> setJustification(Escpos::JUSTIFY_CENTER);';
        $txt .= '$printer -> text("¡Llene sus datos y deposite este ticket en las ánforas para el sorteo navideño!\n");';
        $txt .= '$printer -> feed();';
        $txt .= '$printer -> selectPrintMode();';
        $txt .= '$printer -> text("Nombres/Rzon Soc.:__________________________________________________________________\n");';
        $txt .= '$printer -> text("Direcc.:__________________________________\n");';
        $txt .= '$printer -> text("DNI/RUC.:_________________________________\n");';
        $txt .= '$printer -> text("Teléfono.:________________________________\n");';
        $txt .= '$printer -> text("Correo.:__________________________________\n");';
        $txt .= '$printer -> feed();';
        $txt .= '$printer -> text("Fecha de Impr.: '.date("d-m-Y").' '.date("H:i:s").'\n");';
        $txt .= '$printer -> text("<<No válido como documento contable>>\n");';
        $txt .= '$printer -> feed();';
        $txt .= '$printer -> cut();';
        $txt .= '$printer -> close();';

        $myfile = fopen("../resources/ticket.php", "w") or die("Unable to open file!");
        fwrite($myfile, $txt);
        fclose($myfile);

        $cmdInic = 'netcat -z '.$openCash->cashHeader->printerName.' 9100 && echo "ok" || echo "failed"';

        $output = shell_exec($cmdInic);

        //var_dump($output); die();
        //$output = (string) $output;
        //echo $output; die();

        if($output=="ok\n"){
            //print_r('OKKKTRUE'); die();
            $cmd = 'php '.base_path("/resources/").'ticket.php | nc '.$openCash->cashHeader->printerName.' 9100';
            shell_exec($cmd);
            return true;
        }else{
            //print_r('OKKKFALSE'); die();
            return false;
        }


        //$cmd = 'php '.base_path("/resources/").'ticket.php  > '.base_path("resources/").'ticket.txt';
        //$cmd = 'lpr -P Photosmart-Plus-B209a-m /var/www/html/4Rest/public/newfile.php';
        //shell_exec($cmd);//exec('sudo -u myuser ls /');

        //$cmd2 = 'lpr -P '.$openCash->cashHeader->printerName.' -o raw '.base_path("resources/").'ticket.txt';
        //shell_exec($cmd2);


    }

}