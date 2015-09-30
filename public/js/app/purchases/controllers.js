(function(){
    angular.module('purchases.controllers',[])
        .controller('PurchaseController',['$window','$scope','$http' ,'$routeParams','$location','crudOPurchase','socketService' ,'$filter','$route','$log',
            function($window,$scope,$http, $routeParams,$location,crudOPurchase,socket,$filter,$route,$log){
                $scope.purchases = [];
                $scope.purchase = {};
                $scope.payments=[];
                $scope.payment={};
                $scope.supplier={};
                $scope.methodPayments=[];
                $scope.methodPayment={};
                $scope.detPayment={};
                $scope.inputStocks=[];
                $scope.inputStock={};
                $scope.headInputStocks=[];
                headInputStock={};
                $scope.products=[];
                $scope.product={};
                $scope.pendientAccounts=[];
                $scope.pendientAccount={};
                $scope.cashHeaders=[];
                $scope.cashHeader={};
                $scope.atributes=[];
                $scope.atribute={};
                $scope.date=new Date();
                //$scope.idProvicional;
                $scope.totAnterior;
                $scope.errors = null;
                $scope.success;
                $scope.query = '';
                $scope.stores;
                $scope.purchase.store_id='1';
                $scope.date=new Date();
                $scope.botonReporte = 'Generar Reportes de Ticket';
                 $scope.botonReporteCod = 'Generar Reportes de Sku';
                //------------------------------------------------
             
                //-------------------------------------------------

                $scope.toggle = function () {
                    $scope.show = !$scope.show;
                };
                $scope.pagechan4=function(){
                    crudOPurchase.paginate('pendientAccounts',$scope.currentPage).then(function (data) {
                         $scope.pendientAccounts = data.data;
                    }); 
                }
                $scope.pagechan3=function(){
                    //alert(idobcional);
                    crudOPurchase.paginate('detPayments',$scope.currentPage).then(function (data) {
                            $scope.detPayments = data.data;
                        });
                }
                $scope.pagechan2=function(){
                    crudOPurchase.paginate('inputStocks',$scope.currentPage).then(function (data) {
                            $scope.headInputStocks = data.data;
                        });
                }
                $scope.pageChanged = function() {
                    if ($scope.query.length > 0) {
                        crudOPurchase.search('purchases',$scope.query,$scope.currentPage).then(function (data){
                        $scope.purchases = data.data;
                    });
                    }else{
                        crudOPurchase.paginate('purchases',$scope.currentPage).then(function (data) {
                            $scope.purchases = data.data;
                        });
                    }
                };
                var id = $routeParams.id;
                var idobcional;
                if(id)
                {
                    if($location.path() == '/purchases/edit/'+$routeParams.id) {
                    crudOPurchase.byId(id,'purchases').then(function (data) {
                            if(data.fechaEntrega != null) {
                              if (data.fechaEntrega.length > 0) {
                                $scope.purchases.fechaEntrega = new Date(data.fechaEntrega);
                              }
                            }
                             $scope.purchases = data;
                             $scope.purchase.montoBruto=parseFloat(data.montoBruto);
                             $scope.purchase.montoTotal=parseFloat(data.montoTotal);
                             $scope.purchase.descuento=parseFloat(data.descuento); 

                          crudOPurchase.paginateDPedido(data.id,'detailPurchases').then(function (data) {
                             $scope.detailPurchases = data.data;
                             $scope.maxSize = 5;
                             $scope.totalItems = data.total;
                             $scope.currentPage = data.current_page;
                             $scope.itemsperPage = 15;
                       
                           });
                      });
                     };
                    if($location.path() == '/purchases/show/'+$routeParams.id) {
                        crudOPurchase.select2('payments',id).then(function (data){
                               $scope.payment = data;
                               $scope.idProvicional=data.id;
                                $scope.totAnterior=data.Acuenta;
                            if(Number($scope.payment.Acuenta)>0){
                                  $scope.payment.PorPagado=((Number($scope.payment.Acuenta)*100)/(Number($scope.payment.MontoTotal))).toFixed(2);
                            }else{$scope.payment.PorPagado=0;}
                                  $scope.random();
                                  idobcional=data.id;
                        crudOPurchase.byId($scope.payment.id,'detPayments',1).then(function (data) {
                        $scope.detPayments = data.data;
                        $scope.maxSize = 5;
                        $scope.totalItems = data.total;
                        $scope.currentPage = data.current_page;
                        $scope.itemsperPage = 5;

                    });
                        });
                        crudOPurchase.byId(id,'purchases').then(function (data) {
                            $scope.purchase=data;
                            $scope.alamcenId=data.warehouses_id;
                            $scope.payment.purchase_id=data.id;
                            crudOPurchase.byId(data.supplier_id,'suppliers').then(function (data) {
                                 $scope.supplier=data;
                                $scope.payment.supplier_id=data.id;
                            });
                        crudOPurchase.listaCashes('cashHeaders',$scope.alamcenId).then(function (data) {
                            $scope.cashHeaders = data;
                        
                        });
                });
                        crudOPurchase.paginate('methodPayments',1).then(function (data) {
                        $scope.methodPayments = data.data;
                        $scope.maxSize = 5;
                        $scope.totalItems = data.total;
                        $scope.currentPage = data.current_page;
                        $scope.itemsperPage = 15;

                    });

                      $scope.detPayment.fecha=new Date();
                    };
                }else{
                    crudOPurchase.paginate('purchases',1).then(function (data) {
                        $scope.purchases = data.data;
                        $scope.maxSize = 5;
                        $scope.totalItems = data.total;
                        $scope.currentPage = data.current_page;
                        $scope.itemsperPage = 15;

                    });
                    
                   
                }

                socket.on('purchase.update', function (data) {
                    $scope.purchases=JSON.parse(data);
                });
                $scope.estado;

             /*   $scope.searchEstados=function(){
                    alert($scope.estado);
                    crudOPurchase.all('detailOrderPurchases',$scope.estado).then(function (data) {
                        $scope.purchases = data.data;
                        $scope.maxSize = 5;
                        $scope.totalItems = data.total;
                        $scope.currentPage = data.current_page;
                        $scope.itemsperPage = 15;

                    });methodPayments
                }*/

                crudOPurchase.paginate('suppliers',1).then(function (data) {
                        $scope.suppliers = data.data;
                     });

                $scope.limpiarStocks=function(){
                    $scope.inputStocks=[];
                }

                $scope.editCompra = function(row){
                    $location.path('/purchases/edit/'+row.id);
                };
                 $scope.verOrden= function(row){
                    $location.path('/orderPurchases/edit/'+row.orderPurchase_id);
                };
                $scope.searchPurchase = function(){
                if ($scope.query.length > 0) {
                    crudOPurchase.search('purchases',$scope.query,1).then(function (data){
                        $scope.purchases = data.data;
                        $scope.totalItems = data.total;
                        $scope.currentPage = data.current_page;
                    });
                }else{
                    crudOPurchase.paginate('purchases',1).then(function (data) {
                        $scope.purchases = data.data;
                        $scope.totalItems = data.total;
                        $scope.currentPage = data.current_page;
                    });
                }
                    
                };
                if($location.path() == '/purchases/showD') {
                    crudOPurchase.paginate('pendientAccounts',1).then(function (data) {
                        $scope.pendientAccounts = data.data;
                        $scope.maxSize = 5;
                        $scope.totalItems = data.total;
                        $scope.currentPage = data.current_page;
                        $scope.itemsperPage = 15;

                    });
                    crudOPurchase.autocomplit2('cashHeaders').then(function (data) {
                        $scope.cashHeaders = data;
                        
                        });
                }
                if($location.path() == '/purchases/create') {
                    crudOPurchase.paginate('inputStocks',1).then(function (data) {
                        $scope.headInputStocks = data.data;
                        $scope.maxSize = 5;
                        $scope.totalItems = data.total;
                        $scope.currentPage = data.current_page;
                        $scope.itemsperPage = 15;

                    });
                    crudOPurchase.select('warehouses','select').then(function(data){
                        $scope.warehouses = data;
                    });
                     crudOPurchase.autocomplit('products',1).then(function (data) {
                        $scope.products = data.data;
                       
                       
                    });
                   /*crudOPurchase.autocomplit2('products',1).then(function (data) {
                        $scope.products = data.data;
                    });*/
                    $scope.purchase.fecha=new Date();
                    $scope.purchase.tipo="Entrada";
               }
               $scope.mostrarCreate=false;
               $scope.ver=function(){
                   if ($scope.inputStocksCreateForm.$valid) {
                   $scope.mostrarCreate=!$scope.mostrarCreate;
                   }else{
                    alert("Complete Todos los Campos");
                   }
               }

                $scope.ListarinputStocks=function(row){
                
                crudOPurchase.byId(row.id,'inputStocks').then(function (data){
                            $scope.inputStocks=data.data;
                });
                }
                $scope.verStockActual1=function(){
                   
                    crudOPurchase.StockActual('stocks',$scope.product.proId.varid,$scope.purchase.warehouses_id).then(function (data){
                            $scope.stock=data;
                            $scope.inputStock.CantidaStock=data.stockActual;
                            
                   });
                }
               $scope.verStockActual=function(){
                if($scope.purchase.tipo=="Salida" || $scope.purchase.tipo=="Transferencia"){
                            if($scope.inputStock.CantidaStock<$scope.inputStock.cantidad_llegado || $scope.inputStock.cantidad_llegado<=0){
                                 alert("error esta cantidad es incorrecta no existe en stock");
                                 $scope.inputStock.cantidad_llegado='';
                            }
                }
               }
               //$scope.orderPurchase.eliminar=0;
               $scope.verEdicion=false;
               $scope.canselarEditDeudas=function(){
                $scope.verEdicion=false;
                   $scope.indexPirata=-1;
               }
               $scope.EditarDeudas=function(index){
                    $scope.indexPirata=index;
                    $scope.verEdicion=true;
               }
              $scope.saldoAnterior=0;
               $scope.ActualizarSaldo=function(row,nuevoSaldo){

                    if(Number(row.Saldo) >=nuevoSaldo){
                      if($scope.saldoAnterior==0){$scope.saldoAnterior=Number(row.Saldo);}
                      row.Saldo=$scope.saldoAnterior-nuevoSaldo;
                      if(row.Saldo==0){
                        row.estado=1;
                      }
                    }else{
                        alert("ERROR: el Monto ingresado no debe superar la deuda");
                    }
               }
               $scope.row={};
               $scope.CuentasAFavor=function(row){
                row.fecha=$scope.date.getFullYear()+'-'+($scope.date.getMonth()+1)+'-'+$scope.date.getDate();
                row.hora=$scope.date.getHours()+':'+$scope.date.getMinutes()+':'+$scope.date.getSeconds();
                crudOPurchase.update(row, 'pendientAccounts').then(function (data) {
                            if (data['estado'] == true) {
                                alert('Cuenta Editada Correctamente');
                                $scope.verEdicion=false;
                                $scope.indexPirata=-1;
                                $scope.saldoAnterior=0;
                            } else {
                                $scope.errors = data;

                            }
                        });
               }
               $scope.sacarRowStock=function(index){
                   $scope.inputStocks.splice(index,1);
               }
               $scope.companies=[];
               $scope.company={};
               $scope.badera=true;
               $scope.calCantidad=function(stockActual,atributos,sku,varCodigo,can,talla,TieneVariante){
                alert(TieneVariante);
                //item.NombreAtributos,item.varSku,item.varCodigo,cantidad,item.valorDetAtr,item.TieneVariante
                       // alert(talla);
                        if(can>0 && $scope.purchase.tipo=='Entrada'){
                    
                         
                         if($scope.companies[0]!=undefined){
                             for(var n=0;n<$scope.companies.length;n++){
                                 if($scope.companies[n].talla==talla){
                                 $scope.companies[n].cantidad_llegado=can;
                                 $scope.badera=false;                      
                               }
                             }
                         }
                     if($scope.badera==true){
                       
                    $scope.company.variant_id=varCodigo;
                     //$scope.detailOrderPurchase.preCompra=parseFloat(($scope.detailOrderPurchase.preProducto).toFixed(2));
                      //====================Traendo Presentacion==============================
                      crudOPurchase.select('detpres',varCodigo).then(function (data) {
                                    $scope.company.codigo=data.codigo;
                                    $scope.company.esbase=data.esbase;
                                    if(atributos!=null){
                                       // alert("estoy aqui");
                                    $scope.company.producto=$scope.inputStock.proNombre+"("+atributos+")";
                                   }else{
                                    $scope.company.producto=$scope.inputStock.proNombre+"("+$scope.product.proId.varCodigo+")";
                                   }
                                    $scope.company.detPres_id=data.detpresen_id;
                                    $scope.company.cantidad_llegado=can;
                                    $scope.company.talla=talla;
                       $scope.companies.push($scope.company);
                       $scope.company={};
                                    
                                    
                        });
                    }
                
                     }else{
                        if(can>0 && can<=stockActual){
                             $scope.badera=true;
                             if($scope.companies[0]!=undefined){
                             for(var n=0;n<$scope.companies.length;n++){
                                //alert("jsdjdskdsk"+$scope.companies[n].talla+"--->"+talla);
                                 if($scope.companies[n].talla==talla){
                                  $scope.companies[n].cantidad_llegado=can;
                                   $scope.badera=false;                      
                               }
                             }}
                    if($scope.badera==true){
                       // alert("hey ahora jsdkd");
                    $scope.company.variant_id=varCodigo;
                     crudOPurchase.select('detpres',varCodigo).then(function (data) {
                                   $scope.company.codigo=data.codigo;
                                   $scope.company.esbase=data.esbase;
                                   $scope.company.detPres_id=data.detpresen_id;
                                   $scope.company.cantidad_llegado=can;
                                   $scope.company.talla=talla;
                                   if(atributos!=null){
                                       // alert("estoy aqui");
                                    $scope.company.producto=$scope.inputStock.proNombre+"("+atributos+")";
                                   }else{
                                    $scope.company.producto=$scope.inputStock.proNombre+"("+$scope.product.proId.varCodigo+")";
                                   }
                                   $log.log($scope.company);
                    $scope.companies.push($scope.company);
                    $scope.company={};
                                    
                                    
                        });
                      //====================Fin========================================
                     //$scope.detailOrderPurchases.push($scope.detailOrderPurchase); 
                     }
                        }else{
                            $scope.cantidad='';
                        alert("Ingrese Cantidad mayor a cero o Ingrese Cantidad que no supere el Stock Actual!!!!");
                         }
                     }
                  }
                   $scope.quitarTalla=function(talla,estado){
                    //alert(estado);
                    if(estado==false){
                    var t=0;
                    for(var n=0;n<$scope.companies.length;n++){
                        t++;
                        //alert($scope.companies[n].talla+"-->"+talla);
                        if($scope.companies[n].talla==talla){
                           $scope.companies.splice(t-1,1);
                            break;
                        }
                    }
                    
                }
                   // alert("hola"+t);
                  }
               $scope.codigoVarP;
               $scope.CantidaStock='';
               $scope.obcionales=[];
               $scope.obcional={};
               $scope.mostrarTallas=function(taco){
                    //alert($scope.codigoVarP);
                    if(taco!=null){
                    crudOPurchase.getTallas($scope.codigoVarP,"selectStocksTalla",taco,$scope.purchase.warehouses_id).then(function (data) {
                          $scope.atributes=data.data;
                    });
                    $scope.mostrarPresentacion=false;
                } else{
                    alert("Selecciones un numero de Taco!!!")
                }
                  }
               $scope.mostrarPresentacion=true;
               $scope.Listo=true;
                $scope.asignarProduc1=function(){
                    $scope.inputStock.CantidaStock='';
                    $scope.codigoVarP=$scope.product.proId.varCodigo;
                    $scope.inputStock.proNombre=$scope.product.proId.proNombre;
                    if($scope.product.proId.TieneVariante==1){
                           $scope.inputStock.producto=$scope.inputStock.proNombre+"("+$scope.product.proId.NombreAtributos+")";
                       }else{
                           $scope.inputStock.producto=$scope.inputStock.proNombre+"("+$scope.product.proId.varCodigo+")";
                       }
                    //alert($scope.product.proId.varid);
                     crudOPurchase.MostrarAtributos($scope.product.proId.varCodigo,'Taco').then(function (data) {
                              $scope.variants=data.data;
                                //alert("Estoy Buscando Taco");
                              if($scope.variants.length>0){$scope.Listo=true;$scope.inputStock.cantidad_llegado='';}
                              if($scope.variants[0]==null)
                              {
                                       crudOPurchase.setAtrib($scope.product.proId.varCodigo,$scope.purchase.warehouses_id).then(function (data) 
                                       {
                                              //alert("Estoy Buscando Talla");
                                              $scope.atributes=data.data;
                                             // if($scope.atributes.length>1){$scope.Listo=false;}else{$scope.activarCampCantidad=false;}
                                              //alert($scope.atributes.length);
                                              if($scope.atributes[0]==null)
                                              {
                                                 crudOPurchase.StockActual('stocks',$scope.product.proId.varid,$scope.purchase.warehouses_id).then(function (data){
                                                        $scope.stock=data;
                                                        $scope.inputStock.CantidaStock=data.stockActual;
                            
                                                 });
                                                $scope.Listo=false;
                                                if($scope.product.proId.NombreAtributos!=null)
                                                   {
                                                   $scope.inputStock.producto=$scope.inputStock.proNombre+"("+$scope.product.proId.NombreAtributos+")";
                                                   }else{
                                                    $scope.inputStock.producto=$scope.inputStock.proNombre+"("+$scope.product.proId.proCodigo+")";
                                                }
                                                $scope.activarCampCantidad=true;
                                                 //---------------------------------------------------------------
                                               }else{
                                                  $scope.Listo=true;
                                                  $scope.inputStock.CantidaStock='';
                                                  $scope.inputStock.cantidad_llegado='';
                                                  $scope.mostrarPresentacion=false;
                                               }
                         
                                  });
                                  
                              
                                  }
                            });
                                
                        
            }
               $scope.verEntradasEstock=function(){
                    $scope.purchase.eliminar=1;
                  if( $scope.mostrarPresentacion==false ){
                    //$log.log("///////////////////////////");
                    //$log.log($scope.companies);
                     if(parseInt($scope.purchase.warehouses_id)!=parseInt($scope.purchase.warehouDestino_id)){
                       if($scope.companies[0]!=null && $scope.inputStock.descripcion!=null){
                        for(var n=0;n<$scope.companies.length;n++){
                            //alert($scope.companies[n].cantidad);
                            $scope.companies[n].descripcion=$scope.inputStock.descripcion;
                            $scope.inputStocks.push($scope.companies[n]);
                         }
                         $scope.mostrarPresentacion=true;
                         $scope.product.proId='';
                         $scope.inputStock.CantidaStock='';
                         $scope.detailOrderPurchase.taco='';
                     }else{
                        alert('Es necesario una cantidad o descripcion');
                     }
                    }else{
                       alert("en una transferencia no debe seleccionar dos almacenes iguales??"); 
                    }
                  }else{
                    if ($scope.inputStocksBodyCreateForm.$valid) {
                    if($scope.inputStock.descripcion!=null){
                    //alert($scope.purchase.warehouDestino_id);
                    if(parseInt($scope.purchase.warehouses_id)!=parseInt($scope.purchase.warehouDestino_id)){
                    $scope.inputStock.variant_id=$scope.product.proId.varid;
                    $scope.inputStock.codigo=$scope.product.proId.varCodigo;
                    crudOPurchase.select('detpres',$scope.product.proId.varid).then(function (data) {
                                    $scope.inputStock.esbase=data.esbase;
                                    $scope.inputStock.detPres_id=data.detpresen_id;
                                    crudOPurchase.byId($scope.purchase.warehouses_id,'warehouses').then(function (data) {
                                        $scope.inputStock.nombre=data.nombre;

                                    }); 
                    $scope.inputStocks.push($scope.inputStock);
                    $scope.inputStock={};
                    $scope.product.proId='';
                    if($scope.check==true){
                        $scope.variant.sku='';
                      }
                    });
                 }else{
                    alert("Error no se Puede Seleccionar dos Almacenes Iguales")
                 }
             }else{
                alert("Es necesario una descripcion");
             }
                    }else{alert("complete los campos");}
                 }}
                $scope.soloFinta=function(){
                if($scope.check==true){
                    $scope.Listo=true;
                    $scope.mostrarPresentacion=true;
                    $scope.product.proId='';
                    $scope.inputStock.cantidad_llegado='';
                }
                }
                $scope.filtrarFechas=function(){
                    //alert('ya estas');
                    $scope.temporalfec='';
                    $scope.temporalfech2='';
            if($scope.purchase.fechaini<$scope.purchase.fechafin){
                   if($scope.purchase.fechaini.getDate()<10){
                         $scope.temporalfec="0"+$scope.purchase.fechaini.getDate();
                         if($scope.purchase.fechaini.getMonth()+1<10){
                            $scope.temporalfec=$scope.purchase.fechaini.getFullYear()+"-0"+
                            ($scope.purchase.fechaini.getMonth()+1)+"-"+$scope.temporalfec;
                            
                         }else{
                            $scope.temporalfec=$scope.purchase.fechaini.getFullYear()+"-"+
                            ($scope.purchase.fechaini.getMonth()+1)+"-"+$scope.temporalfec;
                         }
                   }else{
                        $scope.temporalfec=$scope.purchase.fechaini.getDate();
                         if($scope.purchase.fechaini.getMonth()+1<10){
                            $scope.temporalfec=$scope.purchase.fechaini.getFullYear()+"-0"+
                            ($scope.purchase.fechaini.getMonth()+1)+"-"+$scope.temporalfec;
                         }else{
                            $scope.temporalfec=$scope.purchase.fechaini.getFullYear()+"-"+
                            ($scope.purchase.fechaini.getMonth()+1)+"-"+$scope.temporalfec;
                         }
                   }
                   if($scope.purchase.fechafin.getDate()<10){
                         $scope.temporalfech2="0"+$scope.purchase.fechafin.getDate();
                         if($scope.purchase.fechafin.getMonth()+1<10){
                            $scope.temporalfech2=$scope.purchase.fechafin.getFullYear()+"-0"+
                            ($scope.purchase.fechafin.getMonth()+1)+"-"+$scope.temporalfech2;
                            
                         }else{
                            $scope.temporalfech2=$scope.purchase.fechafin.getFullYear()+"-"+
                            ($scope.purchase.fechafin.getMonth()+1)+"-"+$scope.temporalfech2;
                         }
                   }else{
                        $scope.temporalfech2=$scope.purchase.fechafin.getDate();
                         if($scope.purchase.fechafin.getMonth()+1<10){
                            $scope.temporalfech2=$scope.purchase.fechafin.getFullYear()+"-0"+
                            ($scope.purchase.fechafin.getMonth()+1)+"-"+$scope.temporalfech2;
                         }else{
                            $scope.temporalfech2=$scope.purchase.fechafin.getFullYear()+"-"+
                            ($scope.purchase.fechafin.getMonth()+1)+"-"+$scope.temporalfech2;
                         }
                   }
                  // alert($scope.purchase.tipoMov);
                   if($scope.purchase.tipoMov==''){
                    //alert($scope.temporalfec+"////"+$scope.temporalfech2);
                   crudOPurchase.paginarporfechas("inputStocks",$scope.temporalfec,$scope.temporalfech2).then(function (data) {
                        $scope.headInputStocks = data.data;
                        $scope.maxSize = 5;
                        $scope.totalItems = data.total;
                        $scope.currentPage = data.current_page;
                        $scope.itemsperPage = 15;
                   });
               }
                   else{
                    //alert($scope.temporalfec+"cuandpo es falso////"+$scope.temporalfech2);
                        crudOPurchase.paginarfechaTipo("inputStocks",$scope.temporalfec,$scope.temporalfech2,$scope.purchase.tipoMov).then(function (data) {
                        $scope.headInputStocks = data.data;
                        $scope.maxSize = 5;
                        $scope.totalItems = data.total;
                        $scope.currentPage = data.current_page;
                        $scope.itemsperPage = 15;
                   });
                   }
                }else{

                   alert("Error La segunda fecha debe ser una fecha mayor a la primera como minimo en un dia!!")
                }
                }
                $scope.filtrarFecharCompras=function(){
                   // alert($scope.estado);
                if($scope.purchase.fechaini!=null && $scope.purchase.fechafin!=null && $scope.purchase.fechaini<=$scope.purchase.fechafin){
                     //alert($scope.estado);
                   if($scope.purchase.fechaini.getDate()<10){
                         $scope.temporalfec="0"+$scope.purchase.fechaini.getDate();
                         if($scope.purchase.fechaini.getMonth()+1<10){
                            $scope.temporalfec=$scope.purchase.fechaini.getFullYear()+"-0"+
                            ($scope.purchase.fechaini.getMonth()+1)+"-"+$scope.temporalfec;
                            
                         }else{
                            $scope.temporalfec=$scope.purchase.fechaini.getFullYear()+"-"+
                            ($scope.purchase.fechaini.getMonth()+1)+"-"+$scope.temporalfec;
                         }
                   }else{
                        $scope.temporalfec=$scope.purchase.fechaini.getDate();
                         if($scope.purchase.fechaini.getMonth()+1<10){
                            $scope.temporalfec=$scope.purchase.fechaini.getFullYear()+"-0"+
                            ($scope.purchase.fechaini.getMonth()+1)+"-"+$scope.temporalfec;
                         }else{
                            $scope.temporalfec=$scope.purchase.fechaini.getFullYear()+"-"+
                            ($scope.purchase.fechaini.getMonth()+1)+"-"+$scope.temporalfec;
                         }
                   }
                   if($scope.purchase.fechafin.getDate()<10){
                         $scope.temporalfech2="0"+$scope.purchase.fechafin.getDate();
                         if($scope.purchase.fechafin.getMonth()+1<10){
                            $scope.temporalfech2=$scope.purchase.fechafin.getFullYear()+"-0"+
                            ($scope.purchase.fechafin.getMonth()+1)+"-"+$scope.temporalfech2;
                            
                         }else{
                            $scope.temporalfech2=$scope.purchase.fechafin.getFullYear()+"-"+
                            ($scope.purchase.fechafin.getMonth()+1)+"-"+$scope.temporalfech2;
                         }
                   }else{
                        $scope.temporalfech2=$scope.purchase.fechafin.getDate();
                         if($scope.purchase.fechafin.getMonth()+1<10){
                            $scope.temporalfech2=$scope.purchase.fechafin.getFullYear()+"-0"+
                            ($scope.purchase.fechafin.getMonth()+1)+"-"+$scope.temporalfech2;
                         }else{
                            $scope.temporalfech2=$scope.purchase.fechafin.getFullYear()+"-"+
                            ($scope.purchase.fechafin.getMonth()+1)+"-"+$scope.temporalfech2;
                         }
                   }
                    crudOPurchase.paginarporfechas("purchases",$scope.temporalfec,$scope.temporalfech2).then(function (data) {
                        $scope.purchases = data.data;
                        $scope.maxSize = 5;
                        $scope.totalItems = data.total;
                        $scope.currentPage = data.current_page;
                        $scope.itemsperPage = 15;
                   });
                }else{
                    $scope.purchase.fechafin=null;
                    alert("Seleccione Fechas Correctas");
                }
                }
                $scope.limpiarFiltros=function(){
                    $scope.purchase.fechaini=null;
                    $scope.purchase.fechafin=null;
                    $scope.purchase.tipoMov='';
                }
                $scope.MovimientoAlmacen=function(){
                    //alert($scope.check);
                    if($scope.check==true)
                    {    
                        if($scope.purchase.tipoMov!=''){
                          //  alert("hola");
                           crudOPurchase.Reportes($scope.purchase.tipoMov,'movimientoTipo').then(function (data) {
                       // alert("debajo");
                            if (data!= undefined) {
                                $scope.pdfMovimiento=data;
                                alert("Reporte Generado");
                                 //$scope.botonReporte = 'Reporte Completado';
                                 //$scope.verReportTiket1=true;
                                //$location.path("http://www.cnn.com");
                            } else {
                                $scope.errors = data;

                            }
                        });
                     }else{
                        if($scope.purchase.fechaini!=null && $scope.purchase.fechafin!=null && $scope.purchase.fechaini<$scope.purchase.fechafin)
                        {
                            //alert($scope.temporalfec);
                             crudOPurchase.reportesMovFecha('movimientoFechas',$scope.temporalfec,$scope.temporalfech2).then(function (data) {
                       // alert("debajo");
                            if (data!= undefined) {
                                $scope.pdfMovimiento=data;
                                alert("Reporte Generado");
                                 //$scope.botonReporte = 'Reporte Completado';
                                 //$scope.verReportTiket1=true;
                                //$location.path("http://www.cnn.com");
                            } else {
                                $scope.errors = data;

                            }
                        });

                        }
                    }
                        
                    }else{
                      //alert("oyes");
                    if($scope.purchase.tipoMov!=''){
                       crudOPurchase.movimientoFechasTipo('movimientoFechasTipo',$scope.temporalfec,$scope.temporalfech2,$scope.purchase.tipoMov).then(function (data) {
                       // alert("debajo");
                            if (data!= undefined) {
                                $scope.pdfMovimiento=data;
                                alert("Reporte Generado");
                                 //$scope.botonReporte = 'Reporte Completado';
                                 //$scope.verReportTiket1=true;
                                //$location.path("http://www.cnn.com");
                            } else {
                                $scope.errors = data;

                            }
                        });
                    }else{
                        if($scope.purchase.fechaini!=null && $scope.purchase.fechafin!=null && $scope.purchase.fechaini<$scope.purchase.fechafin)
                        {
                           // alert($scope.temporalfec);
                             crudOPurchase.reportesMovFecha('movimientoFechas',$scope.temporalfec,$scope.temporalfech2).then(function (data) {
                       // alert("debajo");
                            if (data!= undefined) {
                                $scope.pdfMovimiento=data;
                                alert("Reporte Generado");
                                 //$scope.botonReporte = 'Reporte Completado';
                                 //$scope.verReportTiket1=true;
                                //$location.path("http://www.cnn.com");
                            } else {
                                $scope.errors = data;

                            }
                        });

                        }
                    }
                    }
                }
                $scope.searchporTipo=function(){
                    crudOPurchase.paginarportipos("inputStocks",$scope.purchase.tipoMov).then(function (data) {
                        $scope.headInputStocks = data.data;
                        $scope.maxSize = 5;
                        $scope.totalItems = data.total;
                        $scope.currentPage = data.current_page;
                        $scope.itemsperPage = 15;
                   });
                }
                $scope.searchSkuEstock=function(sku){
                     $scope.purchase.eliminar=1;

                      crudOPurchase.autocomplitVar('variants',sku).then(function (data) {
                        $scope.product.proId = data;
                        if($scope.product.proId.varid==null){
                            alert('No se a Encontrado Producto');
                            $scope.variant.sku='';
                             $scope.inputStock.CantidaStock='';
                             $scope.Listo=true;
                        }else{
                            if($scope.product.proId.NombreAtributos!=null){
                            $scope.inputStock.producto=$scope.product.proId.proNombre+"("+$scope.product.proId.NombreAtributos+")";
                            }else{
                            $scope.inputStock.producto=$scope.product.proId.proNombre+"("+$scope.product.proId.varCodigo+")";
                            }
                            $scope.Listo=false;
                            $scope.inputStock.cantidad='';
                            $scope.inputStock.CantidaStock='';
                            crudOPurchase.StockActual('stocks',$scope.product.proId.varid,$scope.purchase.warehouses_id).then(function (data){
                            $scope.stock=data;
                            $scope.inputStock.CantidaStock=data.stockActual;
                            
                     });
                    }
                        //alert(data.varCodigo);
            if($scope.product.proId.varCodigo!=null){
                     if(parseInt($scope.inputStock.warehouses_id)!=parseInt($scope.inputStock.warehouDestino_id)){
                     $scope.inputStock.variant_id=$scope.product.proId.varid;
                     $scope.inputStock.codigo=$scope.product.proId.varCodigo;
                     
                 }else{
                    alert("Error no se Puede Seleccionar dos Almacenes Iguales")
                 }}
             });
                    
                 }
                 $scope.verReportTiket1=false;
                 $scope.verReportSku1=false;
                 $scope.verReportTiket=function(){
                     $scope.verReportTiket1=false;
                     $scope.botonReporte = 'Generar Reportes de Ticket';
                 }
                 $scope.verReportSku=function(){
                    $scope.verReportSku1=false;
                    $scope.botonReporteCod = 'Generar Reportes de Sku';
                 }
                $scope.GenerarReportComprasRF=function(){
                    
                     crudOPurchase.reportesMovFecha('reportePorFechacom',$scope.temporalfec,$scope.temporalfech2).then(function (data) {
                        // alert("debajo");
                            if (data!= undefined) {
                                $scope.pdfreportCompr=data;
                                alert("Reporte Generado");
                                 //$scope.botonReporte = 'Reporte Completado';
                                //$location.path("http://www.cnn.com");
                            } else {
                                $scope.errors = data;

                            }
                        });
                }
                $scope.GenerrarReport=function(){
                    //$log.log($routeParams.id);
                    $scope.botonReporte = 'Cargando..';
                    var id=$routeParams.id;
                     crudOPurchase.Reportes(id,'TiketReport').then(function (data) {
                        // alert("debajo");
                            if (data['estado'] == true) {
                                alert('Reporte Generado');
                                 $scope.botonReporte = 'Reporte Completado';
                                 $scope.verReportTiket1=true;
                                //$location.path("http://www.cnn.com");
                            } else {
                                $scope.errors = data;

                            }
                        });
                }
                $scope.cancelarEditPayment=function(){
                    $route.reload();
                }
                $scope.GenerrarReportCod=function(){
                    //$log.log($routeParams.id);
                     $scope.botonReporteCod="Genrando..";
                     crudOPurchase.Reportes($routeParams.id,'CodReport').then(function (data) {
                        // alert("debajo");
                            if (data!= undefined) {
                                $scope.pdf1=data;
                                alert('Reporte Generado');
                                 $scope.botonReporteCod="Reporte Completado";
                                 $scope.verReportSku1=true;
                                //$scope.botonReporteCod = 'Generar Reportes de Sku';
                               // $location.path('/purchases/create');
                            } else {
                                $scope.errors = data;

                            }
                        });
                }
                $scope.nuevo=function(){
                    $scope.mostrarCreate=false;
                    $scope.check=false;
                    $scope.Listo=true;
                    $scope.purchase.tipo="Entrada";
                    $scope.purchase.warehouses_id=''; 
                    $scope.purchase.warehouDestino_id='';
                    $scope.inputStock.cantidad_llegado='';
                    $scope.inputStock.cantidad='';
                    $scope.inputStock.CantidaStock='';
                    $scope.mostrarPresentacion=true;
                    $scope.detailOrderPurchase.taco='';
                    $scope.product.proId='';
                    $scope.inputStock.descripcion='';
                    $scope.inputStocks=[];
                }
                
                $scope.crearEntradasEstock=function(){
                    $scope.purchase.detailOrderPurchases=$scope.inputStocks;
                    $scope.mostrarCreate=!$scope.mostrarCreate;
                     //alert("sobre");
                    crudOPurchase.create($scope.purchase, 'inputStocks').then(function (data) {
                        // alert("debajo");
                            if (data['estado'] == true) {
                                alert('Movimiento Registrado');
                                $scope.purchase.warehouses_id=''; 
                                $scope.purchase.warehouDestino_id='';  
                                $scope.inputStocks=[];                             
                                $scope.mostrarCreate=false;
                                $scope
                                $location.path('/purchases/create');
                            } else {
                                $scope.errors = data;

                            }
                        });
                }
                $scope.traerPayments=function(row){
                    crudOPurchase.byId(row.id,'payments').then(function (data) {
                        $scope.payment=data;
                    });
                    $location.path('/purchases/create');
                }
        ///caja no es mia XD -------------------------------------------------------------------
                $scope.cajas={};
                $scope.cashes={};
                $scope.TraerSales=function(id){
                     crudOPurchase.byId(id,'cashes').then(function (data) {
                        $scope.cashes=data;
                        $scope.payment.cash_id=$scope.cashes.id; 
                        $scope.payment.fecha=$scope.date.getFullYear()+'-'+($scope.date.getMonth()+1)+'-'+$scope.date.getDate();
                        $scope.payment.hora=$scope.date.getHours()+':'+$scope.date.getMinutes()+':'+$scope.date.getSeconds();
                        $scope.payment.montoCaja=$scope.cashes.montoBruto;
                        $scope.payment.montoMovimientoTarjeta=0;
                        $scope.payment.cashMotive_id=7;
                        $scope.payment.estado=1;
                    });
                }

    ///---------------------------------------------------------------------------------
                $scope.Saldo1=0;
                $scope.recalPayments=function(){
                if($scope.Saldo1==0){$scope.Saldo1=$scope.payment.Saldo;}
                if($scope.payment.cash_id>0){
                    if(Number($scope.cashes.montoBruto)<=Number($scope.detPayment.montoPagado)){
                      $scope.detPayment.montoPagado=-1;
                    }
                    $scope.payment.montoMovimientoEfectivo=Number($scope.detPayment.montoPagado);
                    $scope.payment.montoFinal=Number($scope.payment.montoCaja)-$scope.payment.montoMovimientoEfectivo;
                }     //---------------------------------------------------
                if(Number($scope.Saldo1)>=Number($scope.detPayment.montoPagado) && Number($scope.payment.MontoTotal)>=Number($scope.detPayment.montoPagado) && Number($scope.detPayment.montoPagado)>0){
                    if($scope.payment.detpId>0){
                          $scope.payment.Acuenta=Number($scope.totAnterior)-Number($scope.PagoAnterior);
                          $scope.payment.Acuenta=Number($scope.payment.Acuenta)+Number($scope.detPayment.montoPagado);
                          $scope.payment.Saldo=(Number($scope.payment.MontoTotal)-Number($scope.payment.Acuenta)).toFixed(2);
                          $scope.payment.PorPagado=((Number($scope.payment.Acuenta)*100)/(Number($scope.payment.MontoTotal))).toFixed(2);
                          $scope.random();
                    }else{
                          $scope.payment.Acuenta=Number($scope.totAnterior)+Number($scope.detPayment.montoPagado);
                          $scope.payment.Saldo=(Number($scope.payment.MontoTotal)-Number($scope.payment.Acuenta)).toFixed(2);
                          $scope.payment.PorPagado=((Number($scope.payment.Acuenta)*100)/(Number($scope.payment.MontoTotal))).toFixed(2);
                          $scope.random();
                   }
                   }else{
                    $scope.detPayment.montoPagado='';
                    alert('!!Error Usted Solo Puede Ingresar una cantidad menor o igual al total!!');
                }
                }
               $scope.addMethodPaiment=function(){
                 $scope.detPayment=$scope.idProvicional;
                 $scope.detPayments.push($scope.detPayment);
                 $scope.detPayment={};
               }

                $scope.createdetPayment = function(){
                    //$scope.atribut.estado = 1;
                    $scope.detPayment.payment_id=$scope.idProvicional;
                    $scope.payment.detPayments=$scope.detPayment;
                        if ($scope.paymentCreateForm.$valid){
                            crudOPurchase.create($scope.payment, 'detPayments').then(function (data) {
                            if (data['estado'] == true) {
                               alert('grabado correctamente');
                               $scope.totAnterior=$scope.payment.Acuenta;
                               $scope.detPayment={};
                               $scope.detPayment.fecha=new Date();
                               $scope.payment.cash_id=0; 
                               $scope.Saldo1=0;
                               $scope.payment.cajamensual=false;
                               $scope.paginateDetPay();
                            } else {
                                $scope.errors = data;

                            }
                        });
                    }else{
                        alert("error");
                    }
                }
                $scope.paginateDetPay=function(){
                      crudOPurchase.byId($scope.idProvicional,'detPayments').then(function (data) {
                        $scope.detPayments = data.data;
                        $scope.maxSize = 5;
                        $scope.totalItems = data.total;
                        $scope.currentPage = data.current_page;
                        $scope.itemsperPage = 5;

                    });
                }
                $scope.destroyPay = function(row){
                    //alert(row.detCash_id);
                if(row.detCash_id!=null){
                    //alert(row.cashID);
                    crudOPurchase.comprovarCaja(row.detCash_id).then(function(data){
                        //alert(data.estado);
                        if(data.estado==1){
                            if(confirm("Esta segura de querer eliminar este pago!!!") == true){
                                  $scope.payment.detpId=row.id;
                                  $scope.payment.cashMonthly_id=row.cashMonthly_id;
                                  $scope.payment.detCash_id=row.detCash_id;
                                  crudOPurchase.destroy($scope.payment,'payments').then(function(data)
                                  {
                                      if(data['estado'] == true){
                                          $scope.success = data['nombre'];
                                          alert("Elimnado Correctamente");
                                          $route.reload();
              
                                      }else{
                                          $scope.errors = data;
                                      }
                                  });
                              }
                        }else{
                            alert("zorry Usted no puede eliminar un pago de una caja cerrada");
                        }
                    });
                }else{
                
                  if(confirm("Esta segura de querer eliminar este pago!!!") == true){
                    $scope.payment.detpId=row.id;
                    $scope.payment.cashMonthly_id=row.cashMonthly_id;
                    $scope.payment.detCash_id=row.detCash_id;
                    crudOPurchase.destroy($scope.payment,'payments').then(function(data)
                    {
                        if(data['estado'] == true){
                            $scope.success = data['nombre'];
                            alert("Eliminado Correctamente");
                            $route.reload();

                        }else{
                            $scope.errors = data;
                        }
                    });
                }
               }
            }
                $scope.PagoAnterior;
                $scope.mostrarBtnGEd=false;
                 $scope.check=false;
                 $scope.filaenEdicion=false;
                $scope.editDetpayment=function(row){
                 //alert(row.detCash_id);
                if(row.detCash_id!=null){
                    //alert(row.cashID);
                    crudOPurchase.comprovarCaja(row.detCash_id).then(function(data){
                        //alert(data.estado);
                        if(data.estado==1){
                              $scope.check=true;
                              $scope.filaenEdicion=true;
                              if(row.cashMonthly_id>0){
                                  $scope.payment.cajamensual=true;
                                  $scope.payment.cashMonthly_id=row.cashMonthly_id;
                              }else{
                                  $scope.payment.cajamensual=false;
                              }
                              $scope.payment.detpId=row.id;
                              $scope.detPayment.cashe_id=row.cashID;
                              $scope.payment.cash_id=$scope.detPayment.cashe_id;
                              $scope.payment.detCash_id=row.detCash_id;
                              $scope.detPayment.oldPay=row.montoPagado;
                              $scope.PagoAnterior=row.montoPagado;
                              $scope.detPayment.fecha=new Date(row.fecha);
                              $scope.detPayment.methodPayment_id=row.methodPayment_id;
                              $scope.detPayment.montoPagado=(parseFloat(row.montoPagado));
                              $scope.mostrarBtnGEd=true;
                      }else{
                        alert("Error la caja con que se pago ya esta cerrada por ende no se puede registrar los cambios");
                      }
                    });
                }else{
                    $scope.check=true;
                    $scope.filaenEdicion=true;
                    if(row.cashMonthly_id>0){
                        $scope.payment.cajamensual=true;
                        $scope.payment.cashMonthly_id=row.cashMonthly_id;
                    }else{
                        $scope.payment.cajamensual=false;
                    }
                    $scope.payment.detpId=row.id;
                    $scope.detPayment.cashe_id=row.cashID;
                    $scope.payment.cash_id=$scope.detPayment.cashe_id;
                    $scope.payment.detCash_id=row.detCash_id;
                    $scope.detPayment.oldPay=row.montoPagado;
                    $scope.PagoAnterior=row.montoPagado;
                    $scope.detPayment.fecha=new Date(row.fecha);
                    $scope.detPayment.methodPayment_id=row.methodPayment_id;
                    $scope.detPayment.montoPagado=(parseFloat(row.montoPagado));
                    $scope.mostrarBtnGEd=true;
                 }
                }
                
                $scope.cashmontly=function(){
                     $scope.payment.months_id=$scope.date.getMonth()+1;
                     $scope.payment.año=$scope.date.getFullYear();
                     }
                $scope.editPayment = function(){
                    $scope.payment.detPayments=$scope.detPayment;
                    crudOPurchase.update($scope.payment,'payments').then(function(data)
                    {
                        if(data['estado'] == true){
                            $scope.success = data['nombre'];
                            $route.reload();

                        }else{
                            $scope.errors = data;
                        }
                    });
                }
                $scope.pdfPagos='';
                $scope.generarReportePagos=function(){
                        crudOPurchase.Reportes($scope.payment.id,'reportPagos2').then(function (data) {
                             if (data!=null) 
                             {
                                $scope.pdfPagos=data;
                                alert('Reporte Generado');
                             }else {
                                $scope.errors = data;
                             }
                        });
                }

$scope.random = function() {
    var type;

    if ($scope.payment.PorPagado < 25) {
      type = 'info';
    } else if ($scope.payment.PorPagado < 50) {
      type = 'success';
    } else if ($scope.payment.PorPagado < 75) {
      type = 'warning';
    } else {
      type = 'danger';
    }

    $scope.type = type;
  };

              
            }]);
})();
